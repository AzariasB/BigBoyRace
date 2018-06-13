import { Powerup } from './Powerup';
import * as Assets from '../../assets';


export class GlueArea extends Powerup {
    constructor (game: Phaser.Game, x: number, y: number) {
    super(game, x, y, Assets.Images.ImagesGlue.getName());
    this.scale = new Phaser.Point(1.5, 1.5);
    this.anchor.set(0.5, 0.5);
    this.fixedToCamera = true ;
    }
    public makeSound(): void {
    }
    public  activate(): void {
        console.log('activate GlueArea');
    }

}
