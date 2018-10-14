var express = require('express'); // Express web server framework
var fs = require('fs');
var path = require('path');
var axios = require('axios');
var listofrooms;

function getHashParams() {
  var hashParams = {};
  var e, r = /([^&;=]+)=?([^&;]*)/g,
      q = location.hash.substring(1);
  while ( e = r.exec(q)) {
     hashParams[e[1]] = decodeURIComponent(e[2]);
  }
  return hashParams;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname+'/public'));

app.get('/loggedinh', function(req, res) {
  userinfo = JSON.parse(req.query.userinfo);
  var roomcode = "";
  var access_token = req.query.accesstoken
  fs.readFile('data/listofrooms.txt', function(err, data) {
    if (err) throw err;
    listofrooms = JSON.parse(data);
    while (roomcode == "" || listofrooms.roomcodes.includes(roomcode)){
      roomcode = "";
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (var i = 0; i < 5; i++) {
        roomcode += possible.charAt(Math.floor(Math.random() * possible.length));
      }
    }
    listofrooms.roomcodes.push(roomcode);
    // console.log(userinfo);
    // console.log(JSON.stringify(listofrooms));
    // tag = "user1"+req.query.type;
    roomdata = {"numusers": 1, "users": {"host": userinfo}, "hostaccesstoken": access_token}
    fs.writeFile('data/'+roomcode+'.txt', JSON.stringify(roomdata), function (err) {
      if (err) throw err;
      console.log('Saved userinfo!');
    });
    fs.writeFile('data/listofrooms.txt', JSON.stringify(listofrooms), function (err) {
      if (err) throw err;
      console.log('Saved roomcode!');
    });
    res.end(roomcode);
  });
});

app.get('/loggeding', function(req, res) {
  userinfo = JSON.parse(req.query.userinfo);
  inputrc = req.query.rcode_input;
  username = req.query.username;
  fs.readFile('data/listofrooms.txt', function(err, data) {
    if (err) throw err;
    listofrooms = JSON.parse(data);
    if (!listofrooms.roomcodes.includes(inputrc)) {
      res.end('false');
    } else {
      fs.readFile('data/'+inputrc+'.txt', function(err, data1) {
        if (err) throw err;
        roomuserdata = JSON.parse(data1);
        roomuserdata.numusers++;
        roomuserdata.users[username] = userinfo;
        fs.writeFile('data/'+inputrc+'.txt', JSON.stringify(roomuserdata), function(err) {
          if (err) throw err;
          console.log('updated data/'+inputrc+'.txt');
        });
      });
      res.end('true');
    }
  });
});

app.get('/callbackh', function(req, res) {
  res.sendFile(__dirname+'/public/use_access_token_h.html');
});

app.get('/callbackg', function(req, res) {
  res.sendFile(__dirname+'/public/enter_roomcode.html');
});

app.get('/getlistnames', function(req, res) {
  roomcode = req.query.roomcode;
  fs.readFile('data/'+roomcode+'.txt', function(err, data) {
    if (err) {
      console.log(err);
      res.end("");
    } else {
      roomuserdata = JSON.parse(data);
      usernames = [];
      for (username in roomuserdata.users) {
        usernames.push(username);
      }
      out = usernames.join(', ');
      res.end(out);
    }
  });
});

app.get('/getgroupplaylist', function(req, res) {
  roomcode = req.query.roomcode;
  fs.readFile('data/'+roomcode+'.txt', function(err, data) {
    if (err) {
      console.log(err);
      res.end("_");
    } else {
      roomuserdata = JSON.parse(data);
      var playlistcode = roomuserdata.playlistcode;
      var access_token = roomuserdata.hostaccesstoken;
      weightedtracks = [];
      for (username in roomuserdata.users) {
        try {
          templength = roomuserdata.users[username].items.length;
        } catch(e) {
          templength = 0;
        }
        for (var i = 0; i < templength; i++){
          songuri = roomuserdata.users[username].items[i].uri;
          songname = roomuserdata.users[username].items[i].name;
          // console.log(songname, 20-i);
          flag = -1;
          for (var j = 0; j < weightedtracks.length; j++) {
            if (songuri == weightedtracks[j].uri) flag = j;
          }
          if (flag == -1) {
            weightedtracks.push({"name": songname, "uri" : songuri, "weight" : 20-i});
          } else {
            weightedtracks[flag].weight+=(20-i);
          }
        }
      }
      // console.log(weightedtracks);
      weightedtracks.sort(function(a, b) {
        return b.weight - a.weight;
      });
      // console.log(weightedtracks);
      tracknamesinorder=[];
      trackurisinorder=[];
      for (var i = 0; i < weightedtracks.length; i++) {
        tracknamesinorder.push(weightedtracks[i].name);
        trackurisinorder.push(weightedtracks[i].uri);
      }
      filecontents = {"namelist" : tracknamesinorder, "urilist" : trackurisinorder};
      fs.writeFile('data/'+roomcode+'playlist.txt', JSON.stringify(filecontents), function(err) {
        if (err) throw err;
        console.log('initialized data/'+roomcode+'playlist.txt');
      });

      axios({
        method: 'put',
        url: 'https://api.spotify.com/v1/playlists/'+playlistcode+'/tracks',
        data: {uris: trackurisinorder},
        dataType: 'json',
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        }
      }).then(function (response) {
        console.log('Track addition success');
        out = tracknamesinorder.join(", ");
        res.end(out);
      }).catch(function (error) {
        console.log(error);
        out = tracknamesinorder.join(", ");
        res.end(out);
      });
    }
  });
});

app.get('/updatehostcode', function(req, res) {
  var data = JSON.parse(req.query.userinfo);
  var roomcode = req.query.roomcode;
  fs.readFile('data/'+roomcode+'.txt', function(err, data1) {
    if (err) throw err;
    roomdata = JSON.parse(data1);
    hostcode = data.id;
    roomdata["hostcode"] = hostcode;
    fs.writeFile('data/'+roomcode+'.txt', JSON.stringify(roomdata), function(err) {
      if (err) throw err;
      // console.log(hostcode);
      res.end(hostcode);
    })
  });
});

app.get('/updateplaylistcode', function(req, res) {
  var data = JSON.parse(req.query.userinfo);
  // console.log(data);
  var roomcode = req.query.roomcode;
  fs.readFile('data/'+roomcode+'.txt', function(err, data1) {
    if (err) throw err;
    roomdata = JSON.parse(data1);
    var playlistcode
    var createdlist = 'new_playlist';
    for (var i = 0; i < data.items.length; i++) {
      if (data.items[i].name == createdlist) {
        playlistcode = data.items[i].id;
      }
    }
    roomdata["playlistcode"] = playlistcode;
    fs.writeFile('data/'+roomcode+'.txt', JSON.stringify(roomdata), function(err) {
      if (err) throw err;
      // console.log(playlistcode);
      res.end(playlistcode);
    })
  });
});

app.get('/gethostplaylistcode', function(req, res) {
  var roomcode = req.query.roomcode;
  fs.readFile('data/'+roomcode+'.txt', function(err, data) {
    if (err) throw err;
    info = JSON.parse(data);
    out = JSON.stringify({"hostcode" : info.hostcode, "playlistcode" : info.playlistcode});
    res.end(out);
  });
});



files = fs.readdirSync(__dirname+'/data');
for (const file of files) {
  console.log('deleted '+path.join('data', file));
  fs.unlinkSync(path.join('data', file), err => {
    if (err) throw err;
  });
}
listofrooms = {"roomcodes": []};
fs.writeFile('data/listofrooms.txt', JSON.stringify(listofrooms), function (err) {
  if (err) throw err;
  console.log('initialized data/listofrooms.txt!');
});
console.log('Listening on 8000');
app.listen(8000);
// app.listen(3000, '0.0.0.0');
