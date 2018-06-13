import * as Assets from '../../src/assets';
import * as process from 'process';
import { WORLD_GRAVITY } from '../../src/constant';

export default class Lobby extends Phaser.State {

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