
import Game from './game';
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';

export default class Title extends Phaser.State {

    public create(): void {
        new BackgroundScroller(this.game);

        let yPos = 150;
        let tb = new TextButton(this.game, this.game.world.centerX, yPos, {
            text : 'Play !',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.playClick, callbackContext : this});
        yPos += tb.height + 10;

        let optionsB = new TextButton(this.game, this.game.world.centerX, yPos , {
            text : 'Options',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        });
        yPos += optionsB.height + 10;

        let helpB = new TextButton(this.game, this.game.world.centerX, yPos , {
            text : 'Help',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        });
        yPos += helpB.height + 10;

        new TextButton(this.game, this.game.world.centerX, yPos, {
            text : 'Credits',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.creditsClick, callbackContext : this});
    }

    private creditsClick() {
        this.game.state.start('credits');
    }

    private playClick() {
        this.game.camera.onFadeComplete.addOnce(this.loadGame, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadGame() {
        this.game.state.start('lobby');
    }

}