
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import game = PIXI.game;
import LinkedList = Phaser.LinkedList;
import {__String} from 'typescript';
import {Atlases} from '../assets';

export default class Help extends Phaser.State {

    private createButton(x: number, y: number, text: string) {
        new TextButton(this.game, x, y + 10, {
            text: text,
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

    public create(): void {
        new BackgroundScroller(this.game);

        let List = [];
        List.push('How to play ?', '');
        List.push('Go forward', '→');
        List.push('Go Backward', '←');
        List.push('Jump', '↑');
        List.push('Crouch', '↓');
        List.push('Crouch Walk', '↓ →');
        List.push('Slide', '→ ↓');
        List.push('Activate Item', '␣');
        List.push('Activate Chat', '↲');

        let yPos = 15;
        let xPosButton = this.game.width * 2 / 5;
        let xPosText = this.game.width * 3 / 5;
        let button, text;
        let n = 0;
        while (n < List.length) {
            if (n === 0) {
                text = this.game.add.text(this.game.width / 2, yPos, List[n], {
                    font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                    fontSize : 40,
                });
                yPos += text.height + 25;
            } else {
                if (List[n + 1].length === 1) {
                    button = new TextButton(this.game, xPosButton, yPos + 10, {
                        text: List[n + 1],
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
                    let splitted = List[n + 1].split(' ', 2);
                    button = new TextButton(this.game, xPosButton - 25, yPos + 10, {
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
                    button = new TextButton(this.game, xPosButton + 25, yPos + 10, {
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
                text = this.game.add.text(xPosText, yPos, List[n], {
                    font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                    fontSize : 20,
                });
                yPos += button.height + 3;
            }
            text.anchor.set(0.5, 0);
            n += 2;
        }

            this.game.add.text(xPosText, yPos, txt, {
                font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize : 20,
            });
            yPos += 60;
        });

        yPos += 50;
        let tb = new TextButton(this.game, this.game.width * 1 / 5, this.game.height / 2, {
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