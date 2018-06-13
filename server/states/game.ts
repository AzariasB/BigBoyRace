import Player from '../objects/Player';
import * as Assets from '../../src/assets';

export default class Game extends Phaser.State {

    private players: Player[];
    private map: Phaser.Tilemap;
    private collisionLayer: Phaser.TilemapLayer;
    private startPosition: Phaser.Point;

    create() {
        this.map = this.game.add.tilemap(Assets.Tilemaps.JungleMap2.getName());
        this.map.setCollisionByExclusion([], true, 'Collision');
        this.collisionLayer = this.map.createLayer('Collision');
        this.collisionLayer.resizeWorld();

        this.map.objects['Powerups'].map(o => {
            if (o.name === 'start') {
                this.startPosition.set(o.x, o.y);
            }
            // handle the items later
        });

    }

    update() {
        for (let p of this.players) {
            this.game.physics.arcade.collide(p, this.collisionLayer);
            p.update();
        }
        // check for collision with map items' (and add it to the data list to send the players)

        // get all the new traps of the map (and add the to the list to send the players)

        // serialize all the players
        let data = [this.players.length, ...this.players.map(p => p.serialize()).reduce((p, c) => p.concat(c), [])];

        // and send the packet to each player
        for (let p of this.players) {
            const powerupId = 0; // change with the player's powerup
            p.socket.emit('state', new Float32Array([powerupId].concat(data)));
        }
    }

    init(...args: SocketIO.Socket[]) {
        this.players = [];
        for (let i = 0; i < args.length; ++i) {
            this.players.push(new Player(i, args[i], this.game, this.startPosition.x, this.startPosition.y, '', this.map, this.collisionLayer));
            args[i].emit('id', i);
            args[i].on('inputs', (data: Int8Array) => {
                this.players[i].handleInput(data);
            });
            this.game.add.existing(this.players[i]);
        }
    }
}