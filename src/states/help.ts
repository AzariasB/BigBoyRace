
import Game from './game';
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import game = PIXI.game;
import LinkedList = Phaser.LinkedList;
import {__String} from 'typescript';
import {Atlases} from "../assets";

export default class Help extends Phaser.State {

    public create(): void {
        new BackgroundScroller(this.game);


        let List = new Array('How to play ?');
        List.push('Go forward');
        List.push('Go Backward');
        List.push('Jump');
        List.push('Crouch');
        List.push('Crouch Walk');
        List.push('Slide');
        List.push('Activate Item');
        List.push('Activate Chat');

        let key = new Array('');
        key.push('→');
        key.push('←');
        key.push('↑');
        key.push('↓');
        key.push('↓ →');
        key.push('→ ↓');
        key.push('␣');
        key.push('↲');

        let yPos = 15;
        let xPosButton = 355;
        let xPosText = 450;
        let n = 0;
        while (n < List.length) {
            if (n === 0) {
                this.game.add.text(300, yPos, List[n], {
                    font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                    fontSize : 40,
                });
                yPos += 75;
            } else {
                if (key[n].length === 1) {
                    new TextButton(this.game, xPosButton, yPos + 10, {
                        text: key[n],
                        font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                        fontSize: 25
                    }, {
                        key: Atlases.AtlasesBlueSheet.getName(),
                        over: Atlases.AtlasesBlueSheet.Frames.BlueButton11,
                        out: Atlases.AtlasesBlueSheet.Frames.BlueButton09,
                        down: Atlases.AtlasesBlueSheet.Frames.BlueButton10,
                        up: Atlases.AtlasesBlueSheet.Frames.BlueButton09
                    });
                } else {
                    let splitted = key[n].split(' ', 2);
                    new TextButton(this.game, xPosButton - 25, yPos + 10, {
                        text: splitted[0],
                        font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                        fontSize: 25
                    }, {
                        key: Atlases.AtlasesBlueSheet.getName(),
                        over: Atlases.AtlasesBlueSheet.Frames.BlueButton11,
                        out: Atlases.AtlasesBlueSheet.Frames.BlueButton09,
                        down: Atlases.AtlasesBlueSheet.Frames.BlueButton10,
                        up: Atlases.AtlasesBlueSheet.Frames.BlueButton09
                    });
                    new TextButton(this.game, xPosButton + 25, yPos + 10, {
                        text: splitted[1],
                        font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                        fontSize: 25
                    }, {
                        key: Atlases.AtlasesBlueSheet.getName(),
                        over: Atlases.AtlasesBlueSheet.Frames.BlueButton11,
                        out: Atlases.AtlasesBlueSheet.Frames.BlueButton09,
                        down: Atlases.AtlasesBlueSheet.Frames.BlueButton10,
                        up: Atlases.AtlasesBlueSheet.Frames.BlueButton09
                    });
                }
                this.game.add.text(xPosText, yPos, List[n], {
                    font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                    fontSize : 20,
                });
                yPos += 50;
            }
            n++;
        }

        yPos += 50;
        let tb = new TextButton(this.game, 150, this.game.world.centerY, {
            text : 'Return',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.returnClick, callbackContext : this});
    }

    private returnClick() {
        this.game.camera.onFadeComplete.addOnce(this.loadReturn, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadReturn() {
        this.game.state.start('title');
    }

}