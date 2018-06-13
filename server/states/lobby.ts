import * as Assets from '../../src/assets';
import * as process from 'process';
import { WORLD_GRAVITY, N_PLAYERS } from '../../src/constant';

export default class Lobby extends Phaser.State {

    private server: SocketIO.Server;
    private clients: SocketIO.Socket[];

    constructor() {
        super();
        this.clients = [];
    }

    setServer(server: SocketIO.Server) {
        this.server = server;

        this.server.on('connection', socket => {
            if (this.game.state.current !== 'lobby') {
                this.clients = [];
                this.game.state.start('lobby');
            }

            this.clients.push(socket);
            socket.emit('connected');

            if (this.clients.length === N_PLAYERS) {
                console.log('Starting game !');
                this.clients.map(c => c.emit('start'));
                this.state.start('game', null, null, this.clients);
            }
        });
    }

    preload() {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = WORLD_GRAVITY;
        this.game.load.onFileError.add((err) => {
            console.error(err);
        });

        this.game.load.tilemap(Assets.Tilemaps.JungleMap2.getName(),
                                'file://' + process.cwd() +  '/assets/tilemaps/JungleMap2.json',
                                null,
                                Phaser.Tilemap.TILED_JSON);

    }
}