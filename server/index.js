const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http, {path : '/grace/socket'});

let players = [];

io.on('connection', socket => {
    console.log('a user connected');
    if (players.length === 2)return socket.disconnect();
    players.push(socket);

    socket.emit('connected', new Float32Array(true));

    if (players.length === 2) {
        players.map(x=>x.emit('start'));
    }

    socket.on('update', function(data) {
        players.map(x => {
            if (x !== socket)x.emit('update', data);
        });
    });

    socket.on('disconnect', function(){
        console.log('the user disconnected');
        players = players.filter(x => x !== socket);
    });
});

http.listen(4334, function() {
        console.log('Example app listening on port 4334!');
    }
);