
import Game from './game';
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import game = PIXI.game;
import LinkedList = Phaser.LinkedList;
import {__String} from 'typescript';
import {Atlases} from '../assets';

export default class Build extends Phaser.State {

    public create(): void {
        new BackgroundScroller(this.game);

        let xPos = this.game.width / 2;
        let yPos = 30;
        let text;
        text = this.game.add.text(xPos, yPos, 'Make your party !', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 30,
        });
        text.anchor.set(0.5, 0);

        yPos += text.height + 20
        let tb = new TextButton(this.game, this.game.width / 2, yPos, {
            text : 'Return',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.returnClick, callbackContext : this});
    }

    private returnClick() {
        this.game.camera.onFadeComplete.addOnce(this.loadReturn, this);
        this.game.camera.fade(0x000000, 500);
    }

    private loadReturn() {
        this.game.state.start('title');
    }

}