const express = require('express')
const app = express()
const path = require('path');
const http = require('http').Server(app);
const io = require('socket.io')(http, {path : '/infrace/socket'});

const publicDir = path.join(__dirname, "/../dist");

app.use(express.static(publicDir))

app.get('/', (req, res) => res.sendFile(path.join(publicDir, "index.html")));

let players = [];

io.on('connection', socket => {
    console.log('a user connected');
    if (players.length == 2)return socket.disconnect();
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
        players = players.filter(x => x != socket);
    });
});

http.listen(4334, () => console.log('Example app listening on port 4334!'))