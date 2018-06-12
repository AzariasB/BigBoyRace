import { Player } from '../Player';

export abstract class Powerup {
    abstract makeSound(): void;
    abstract activate(player: Player ): void;



}
