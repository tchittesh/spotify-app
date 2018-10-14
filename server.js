var express = require('express'); // Express web server framework
var fs = require('fs');
var path = require('path');
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
    console.log(userinfo);
    console.log(JSON.stringify(listofrooms));
    // tag = "user1"+req.query.type;
    roomdata = {"numusers": 1, "users": {"host": userinfo}}
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

// app.get('/getgroupplaylist', function(req, res) {
//   roomcode = req.query.roomcode;
//   fs.readFile('data/'+roomcode+'.txt', function(err, data) {
//     if (err) {
//       console.log(err);
//       res.end("_");
//     } else {
//       roomuserdata = JSON.parse(data);
//       weightedtracks = {};
//       for (username in roomuserdata.users) {
//         weightedtracks[roomuserdata.users.username.]
//       }
//
//       usernames = [];
//       for (username in roomuserdata.users) {
//         usernames.push(username);
//       }
//       out = usernames.join(', ');
//       res.end(out);
//     }
//   });
// });



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
