
import TextButton from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import { Carousel, CarouselType } from '../widgets/carousel';
import { N_MAX_PLAYERS, N_MAX_ROUNDS, N_MIN_PLAYERS, N_MIN_ROUNDS } from '../constant';

export default class CreateState extends Phaser.State {

    private playersCarousel: Carousel;
    private mapCarousel: Carousel;
    private roundCarousel: Carousel;

    public create(): void {
        new BackgroundScroller(this.game);

        let xPos = this.game.width / 2;
        let yPos = 30;
        let text;
        text = this.game.add.text(xPos, yPos, 'Create your game !', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 30,
        });
        text.anchor.set(0.5, 0);
        yPos += text.height + 50;

        text = this.game.add.text(this.game.width * 1 / 5, yPos, 'How many players ?', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 25,
        });
        let playerChoices = Array.from({length: N_MAX_PLAYERS - 1}, (_, i) => (i + N_MIN_PLAYERS) + '');

        this.game.add.existing(this.playersCarousel = new Carousel(
            this.game,
            xPos + text.width / 2 - 10,
            yPos + 20,
            CarouselType.Small,
            playerChoices
        ));

        yPos += text.height + 30;

        text = this.game.add.text(this.game.width * 1 / 5, yPos, 'On which map ?', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 25,
        });

        let maps = [];
        for (let m in Assets.Tilemaps) maps.push(m);
        this.game.add.existing(this.mapCarousel = new Carousel(
            this.game,
            xPos + text.width / 2 - 10,
            yPos + 20,
            CarouselType.Large,
            maps
        ));

        yPos += text.height + 50;


        text = this.game.add.text(this.game.width / 5, yPos, 'How many rounds ?', {
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 25
        });

        let roundChoices = Array.from({length: N_MAX_ROUNDS}, (_, i) => '' + (i + N_MIN_ROUNDS));
        this.game.add.existing(this.roundCarousel = new Carousel(
            this.game,
            xPos + text.width / 2 - 10,
            yPos + 20,
            CarouselType.Small,
            roundChoices
        ));

        yPos += text.height + 100;

        this.game.add.existing(new TextButton(this.game, this.game.width * 3 / 8, yPos, {
            text : 'Validate',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.validateClick, callbackContext : this}));

        this.game.add.existing(new TextButton(this.game, this.game.width * 5 / 8, yPos, {
            text : 'Cancel',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.returnClick, callbackContext : this}));
    }

    private validateClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.goToLobby());
        this.game.camera.fade(0x000000, 500);
    }

    private goToLobby() {
        this.state.start('lobby',
            true,
            false,
            true,
            this.mapCarousel.selectedValue,
            + this.playersCarousel.selectedValue,
            + this.roundCarousel.selectedValue
        );
    }

    private returnClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.game.state.start('title'), this);
        this.game.camera.fade(0x000000, 500);
    }

}