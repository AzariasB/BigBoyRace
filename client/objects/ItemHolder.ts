import * as Assets from '../assets';


export default class ItemHolder extends Phaser.Sprite {

    constructor (game: Phaser.Game, x: number, y: number, group: string, frame: string) {
        super(game, x, y, group, frame);
        this.scale = new Phaser.Point(1.5, 1.5);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = true ;
    }

}
