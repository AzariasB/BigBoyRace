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

            // anti-cheat goes here
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

//--- IMPLEMENTATION EXAMPLE OF PHASER ON NODE.JS ------
require('./phaser');
var game = new Phaser.Game(800, 600, Phaser.HEADLESS, 'phaser-example', { preload: preload, create: create });

function preload() {
    game.load.tilemap('JungleMap', 'file://'+__dirname+'/../assets/tilemaps/JungleMap.json', null, Phaser.Tilemap.TILED_JSON);


    //game.load.image('tiles', 'file://'+__dirname+'/../assets/tilesets/jungle_tileset.png');

}

var map;
var layer;

function create() {

    //game.stage.backgroundColor = '#787878';
    map = game.add.tilemap('JungleMap');

    //map.addTilesetImage('tiles');

    layer = map.createLayer('Background');
    layer.resizeWorld();

}