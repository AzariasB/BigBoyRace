import * as Assets from '../../src/assets';
import * as process from 'process';


export default class Lobby extends Phaser.State {

    preload() {

        this.game.load.onFileError.add((err) => {
            console.error(err);
        });

        this.game.load.tilemap(Assets.Tilemaps.JungleMap2.getName(),
                                'file://' + process.cwd() +  '/assets/tilemaps/JungleMap2.json',
                                null,
                                Phaser.Tilemap.TILED_JSON);
    }
}