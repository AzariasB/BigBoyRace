import { Player } from '../Player';

export abstract class Powerup extends Phaser.Sprite {
    abstract makeSound(): void;
    abstract activate(): void;



}
