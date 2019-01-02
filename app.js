/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var roomID ;
// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
server.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
io.on('connection', function(socket){

  console.log('a user connected');
  socket.on("create or join",function(room){
    roomID = room;
  	console.log('Received request to create or join room ' + room);
  	var clientsInRoom = io.sockets.adapter.rooms[room];
  	console.log(clientsInRoom); 
  	var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
  	console.log('Room ' + room + ' now has ' + numClients + ' client(s)');
  	if(numClients === 0)
  	{
  		socket.join(room);
  		console.log('Client ID ' + socket.id + ' created room ' + room);
  		socket.emit('created', room, socket.id);
  	}
  	else if(numClients === 1){
  		console.log('Client ID ' + socket.id + ' joined room ' + room);
  		io.sockets.in(room).emit('join', room);
  		socket.join(room);
  		socket.emit('joined', room, socket.id);
  		io.sockets.in(room).emit('ready');
  	}
  	else{
  		socket.emit('full', room);
  	}
  });

// hPjqXN2oD2bpPJM1AAAB



  socket.on("Localcandidate",function(event){
  	console.log(event);
  	socket.broadcast.to(roomID).emit('romotecandidate', event);
  });
  socket.on("localOfferDes",function(des){
  	socket.broadcast.to(roomID).emit('remoteOfferDes', des);
  });
  socket.on("remoteAnswerDes",function(des){
  	socket.broadcast.to(roomID).emit('OfferDes', des);
  });
  socket.on("sendRemoteCandidateToLocal",function(des){
  	socket.broadcast.to(roomID).emit('sendRemoteCandidate', des);
  });
});