
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


        let List = new Array('Project made by IMT students');
        List.push('Jean-Baptiste ABET');
        List.push('Azarias BOUTIN');
        List.push('Tommy KAINDOH');
        List.push('Maxime MOCKELS');
        List.push('Guillaume RAFFI');
        List.push('Lucas SEGRAIS');

        let yPos = 100;
        let n = 0;
        while (n < List.length) {
            this.game.add.text((300 - (List[n].length / 2)), yPos, List[n], {
                font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize : 20,
            });
            yPos += 30;
            n++;
        }

        yPos += 100
        let tb = new TextButton(this.game, this.game.world.centerX, yPos, {
            text : 'Return',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.returnClick, callbackContext : this});
        yPos += tb.height + 10;
    }

    private returnClick() {
        this.game.camera.onFadeComplete.addOnce(this.loadReturn, this);
        this.game.camera.fade(0x000000, 1000);
    }

    private loadReturn() {
        this.game.state.start('title');
    }

}