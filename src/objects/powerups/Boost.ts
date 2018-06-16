import { Powerup } from './Powerup';
import * as Assets from '../../assets';
import { Player } from '../Player';


export class Boost extends Powerup {
    constructor (game: Phaser.Game, x: number, y: number) {
    super(game, x, y, Assets.Images.ImagesBox.getName());
    // this.scale = new Phaser.Point(1.5, 1.5);
    this.anchor.set(0.5, 0.5);
    this.fixedToCamera = true ;
    }
    public makeSound(): void {
    }
    public  activate(player: Player): void {
        console.log('activate box');
    }
    public effect(): void {
    }

}
