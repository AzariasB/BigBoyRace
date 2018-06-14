
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
        let text, tb;
        text = this.game.add.text(xPos, yPos, 'Make your party !', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 30,
        });
        text.anchor.set(0.5, 0);
        yPos += text.height + 50;

        text = this.game.add.text(this.game.width * 1 / 5, yPos, 'How many players ?', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 25,
        });
        yPos += text.height + 50;

        let n = 2;
        let nbPlayerMax = 6;
        while (n < nbPlayerMax + 1) {
            tb = new TextButton(this.game, this.game.width * n / (nbPlayerMax + 2) , yPos, {
                text: n,
                font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 20
            }, {
                key: Atlases.AtlasesBlueSheet.getName(),
                    over: Atlases.AtlasesBlueSheet.Frames.BlueButton11,
                    out: Atlases.AtlasesBlueSheet.Frames.BlueButton09,
                    down: Atlases.AtlasesBlueSheet.Frames.BlueButton10,
                    up: Atlases.AtlasesBlueSheet.Frames.BlueButton09
            });
            n++;
        }
        yPos += tb.height + 50;

        text = this.game.add.text(this.game.width * 1 / 5, yPos, 'On which map ?', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 25,
        });
        yPos += text.height + 50;

        n = 0;
        let nbMap = 5;
        while (n < nbMap) {
            tb = new TextButton(this.game, this.game.width * (n + 1) / (nbMap + 1), yPos, {
                text: n,
                font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 20
            }, {
                key: Atlases.AtlasesBlueSheet.getName(),
                over: Atlases.AtlasesBlueSheet.Frames.BlueButton11,
                out: Atlases.AtlasesBlueSheet.Frames.BlueButton09,
                down: Atlases.AtlasesBlueSheet.Frames.BlueButton10,
                up: Atlases.AtlasesBlueSheet.Frames.BlueButton09
            });
            n++;
        }
        yPos += tb.height + 50;

        tb = new TextButton(this.game, this.game.width / 2, yPos, {
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