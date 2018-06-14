
import Game from './game';
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import game = PIXI.game;
import LinkedList = Phaser.LinkedList;
import {__String} from 'typescript';

export default class Credits extends Phaser.State {

    public create(): void {
        new BackgroundScroller(this.game);


        let List = new Array('Project made by IMT Mines Alès students');
        List.push('Jean-Baptiste ABET');
        List.push('Azarias BOUTIN');
        List.push('Tommy KAINDOH');
        List.push('Maxime MOCKELS');
        List.push('Guillaume RAFFI');
        List.push('Lucas SEGRAIS');

        let yPos = 50;
        let xPos = this.game.width / 2;
        let text;
        let n = 0;
        while (n < List.length) {
            if (n === 0) {
                text = this.game.add.text(xPos, yPos, List[n], {
                    font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                    fontSize : 30,
                });
                yPos += 50;
            } else {
                text = this.game.add.text(xPos, yPos, List[n], {
                    font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                    fontSize : 20,
                });
            }
            text.anchor.set(0.5, 0);
            yPos += text.height + 10;
            n++;
        }

        yPos += 50
        let tb = new TextButton(this.game, xPos, yPos, {
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