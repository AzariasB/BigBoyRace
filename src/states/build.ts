
import Game from './game';
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import game = PIXI.game;
import LinkedList = Phaser.LinkedList;
import {__String} from 'typescript';
import {Atlases} from '../assets';

export default class Build extends Phaser.State {

    private players: string = '2';
    private myMap: string = 'JungleMap2';

    public create(): void {
        new BackgroundScroller(this.game);

        let xPos = this.game.width / 2;
        let yPos = 30;
        let text, tb;
        let nbPlayer, mapChosen;
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
        yPos += text.height + 30;

        let nbPlayerMax = 6;
        for (let i = 2; i < nbPlayerMax + 1; ++i) {
            tb = new TextButton(this.game, this.game.width * i / (nbPlayerMax + 2) , yPos, {
                text: i + '',
                font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 20
            }, {
                key: Atlases.AtlasesBlueSheet.getName(),
                    over: Atlases.AtlasesBlueSheet.Frames.BlueButton11,
                    out: Atlases.AtlasesBlueSheet.Frames.BlueButton09,
                    down: Atlases.AtlasesBlueSheet.Frames.BlueButton10,
                    callback : () =>  this.nbPlayer(i)
            });
        }
        yPos += tb.height + 30;

        text = this.game.add.text(this.game.width * 1 / 5, yPos, 'On which map ?', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 25,
        });
        yPos += text.height + 30;

        let nbMap = 0;
        let i = 0;
        for (let map in Assets.Tilemaps) { nbMap++; }

        for (let map in Assets.Tilemaps) {
            tb = new TextButton(this.game, this.game.width * (i + 1) / (nbMap + 1), yPos, {
                text: map,
                font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 20
            }, {
                callback : () =>  this.mapChosen(map)
            });
            i++;
        }
        yPos += tb.height + 50;

        tb = new TextButton(this.game, this.game.width * 3 / 8, yPos, {
            text : 'Validate',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.validateClick, callbackContext : this});

        tb = new TextButton(this.game, this.game.width * 5 / 8, yPos, {
            text : 'Cancel',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : this.returnClick, callbackContext : this});
    }

    private nbPlayer(nb) {
        this.players = nb;
    }

    private mapChosen(map) {
        this.myMap = map;
    }

    private validateClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.state.start('lobby', true, false, true, this.myMap, +this.players));
        this.game.camera.fade(0x000000, 500);
    }

    private returnClick() {
        this.game.camera.onFadeComplete.addOnce(this.loadReturn, this);
        this.game.camera.fade(0x000000, 500);
    }

    private loadReturn() {
        this.game.state.start('title');
    }

}