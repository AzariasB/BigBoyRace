import { Game } from 'phaser-ce';
import { Atlases } from '../assets';

export enum CarouselType {
    Small = 'small',
    Large = 'large'
}

export class Carousel extends Phaser.Group {

    private leftButton: Phaser.Sprite;
    private centerText: Phaser.Sprite;
    private rightButton: Phaser.Sprite;
    private center: Phaser.Text;

    constructor(game: Game,
        xCenter: number,
        yCenter: number,
        private cType: CarouselType,
        private values: string[]) {
        super(game);
        
        let offset = (this.cType === CarouselType.Small) ? 50 : 100;

        this.leftButton = new Phaser.Button(
                this.game, 
                xCenter - offset, 
                yCenter, 
            Asse )
    }
}