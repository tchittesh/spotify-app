var express = require('express'); // Express web server framework
var fs = require('fs');
var path = require('path');
var listofrooms;

var client_id = 'c4afbd083ef34b34810c5b3c16a2e08d'; // Your client id
// var client_secret = 'CLIENT_SECRET'; // Your secret
var redirect_uri = 'http://localhost:8000/callback'; // Your redirect uri

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
    roomdata = {"numusers": 1, "users": {"host": req.query.userinfo}}
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

// app.get('/loggeding', function(req, res) {
//   userinfo = JSON.parse(req.query.userinfo);
//   inputrc = req.query.rcode_input;
//   fs.readFile('data/listofrooms.txt', function(err, data) {
//     if (err) throw err;
//     listofrooms = JSON.parse(data);
//     if (!listofrooms.roomcodes.includes(inputrc)) res.sendFile(__dirname+'/public/enter_roomcode.html');
//     fs.readFile('data/'+inputrc+'.txt', function(err, data1) {
//       if (err) throw err;
//       roomuserdata = JSON.parse(data1);
//       roomuserdata.numusers++;
//       temp = "user"+roomuserdata.numusers;
//       roomuserdata.users.temp = userinfo;
//       fs.writeFile('data/'+inputrc+'.txt', JSON.stringify(roomuserdata), function(err) {
//         if (err) throw err;
//         console.log('updated data/'+inputrc+'.txt');
//       });
//     });
//   res.sendFile(__dirname+'/public/loggedin.html');
// });

app.get('/callback', function(req, res) {
  res.sendFile(__dirname+'/public/use_access_token.html');
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
