
import TextButton from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import {Atlases} from '../assets';

export default class HelpState extends Phaser.State {

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

        let buttons = [
            ['Go forward', '→'],
            ['Go Backward', '←'],
            ['Jump', '↑'],
            ['Crouch', '↓'],
            ['Crouch Walk', '↓→'],
            ['Slide', '→↓'],
            ['Activate Item', '␣'],
            ['Activate Chat', '↲']
        ];

        let yPos = 15;
        let xPosButton = this.game.width * 2 / 5;
        let xPosText = this.game.width * 3 / 5;
        let text = this.game.add.text(this.game.width / 2, yPos, 'How to play ?', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 40,
        });
        yPos += text.height + 25;

        buttons.map(([text, key]) => {
            if (key.length === 1) {
                this.createButton(xPosButton, yPos + 10, key);
            } else {
                this.createButton(xPosButton - 25, yPos + 10, key[0]);
                this.createButton(xPosButton + 25, yPos + 10, key[1]);
            }
            yPos += this.game.add.text(xPosText, yPos, text, {
                font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize : 20,
            }).height + 25;
        });

        yPos += 50;
        this.game.add.existing(new TextButton(this.game, this.game.width * 1 / 5, this.game.height / 2, {
            text : 'Return',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.returnClick, callbackContext : this}));
    }

    private returnClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.state.start('title'), this);
        this.game.camera.fade(0x000000, 500);
    }
}