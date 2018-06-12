import { Powerup } from './Powerup';


export class EmptyPowerup extends Powerup {
    public makeSound(): void {
    }
    public  activate(): void {
        console.log('activate emptypowerup');
    }

}