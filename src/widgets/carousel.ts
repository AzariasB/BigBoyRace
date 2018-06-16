import { Game } from 'phaser-ce';
import { Atlases, CustomWebFonts } from '../assets';

export enum CarouselType {
    Small = 'small',
    Large = 'large'
}

export class Carousel extends Phaser.Group {

    private leftButton: Phaser.Button;
    private centerText: Phaser.Text;
    private centerSprite: Phaser.Sprite;
    private rightButton: Phaser.Button;
    public onChangeSelection = (i, _) => {};

    constructor(game: Game,
        xCenter: number,
        yCenter: number,
        private cType: CarouselType,
        private values: string[],
        private currentIndex: number = 0) {
        super(game);

        let offset = (this.cType === CarouselType.Small) ? 40 : 110;
        const centerFrame = this.cType === CarouselType.Small ?
                            Atlases.AtlasesBlueSheet.Frames.BlueButton12 :
                            Atlases.AtlasesBlueSheet.Frames.BlueButton03;

        const leftS = Atlases.AtlasesGreySheet.Frames.GreySliderLeft;
        const rightS = Atlases.AtlasesGreySheet.Frames.GreySliderRight;

        this.leftButton = new Phaser.Button(
                this.game,
                xCenter - offset,
                yCenter,
                Atlases.AtlasesGreySheet.getName(),
                () => this.decrement(), null,
                leftS,
                leftS,
                leftS,
                leftS
            );
        this.leftButton.anchor.set(0.5, 0.5);
        this.add(this.leftButton);

        this.rightButton = new Phaser.Button(
            this.game,
            xCenter + offset,
            yCenter,
            Atlases.AtlasesGreySheet.getName(),
            () => this.increment(), null,
            rightS,
            rightS,
            rightS,
            rightS
        );
        this.rightButton.anchor.set(0.5, 0.5);
        this.add(this.rightButton);

        this.centerSprite = new Phaser.Sprite(
            this.game,
            this.centerX,
            this.centerY,
            Atlases.AtlasesBlueSheet.getName(),
            centerFrame
        );
        this.centerSprite.anchor.set(0.5, 0.5);
        this.add(this.centerSprite);
        this.rightButton.bringToTop();
        this.leftButton.bringToTop();

        this.centerText = new Phaser.Text(this.game, this.centerX, this.centerY, this.selectedValue, {
            fontSize: 20,
            font: CustomWebFonts.FontsKenvectorFuture.getName()
        });
        this.centerText.anchor.set(0.5, 0.5);
        this.add(this.centerText);
    }

    get selectedValue() {
        return this.values[this.currentIndex];
    }

    private updateCurrentValue() {
        this.centerText.text = this.selectedValue;
        this.onChangeSelection(this.currentIndex, this.selectedValue);
    }

    public decrement() {
        if (this.currentIndex === 0) {
            this.currentIndex = this.values.length - 1;
        } else {
            this.currentIndex--;
        }
        this.updateCurrentValue();
    }

    public increment() {
        if (this.currentIndex === this.values.length - 1) {
            this.currentIndex = 0;
        } else {
            this.currentIndex++;
        }
        this.updateCurrentValue();
    }
}