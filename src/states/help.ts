
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
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

        let keys = [
            ['Move', '←→'],
            ['Jump', '↑'],
            ['Crouch', '↓'],
            ['Crouch Walk', '↓→'],
            ['Slide', '→↓'],
            ['Activate Item', '␣'],
            ['Activate Chat', '↲'],
        ];

        let yPos = 18;
        let xPosButton = 355;
        let xPosText = 450;
        this.game.add.text(300, yPos, 'How to play ?', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 40,
        });

        yPos += 75;

        keys.map(k => {
            let [txt, key] = k;
            if (key.length === 2) {
                this.createButton(xPosButton - 25, yPos, key[0]);
                this.createButton(xPosButton + 25, yPos, key[1]);
            } else {
                this.createButton(xPosButton, yPos, key[0]);
            }

            this.game.add.text(xPosText, yPos, txt, {
                font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize : 20,
            });
            yPos += 60;
        });

        yPos += 50;
        new TextButton(this.game, 150, this.game.world.centerY, {
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