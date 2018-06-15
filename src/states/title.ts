
import Game from './game';
import TextButton, { ButtonOptions } from '../widgets/TextButton';
import BackgroundScroller, { } from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import { Network } from '../network';

export default class Title extends Phaser.State {


    public create(): void {
        this.world.setBounds(0, 0, this.game.width, this.game.height);

        new BackgroundScroller(this.game);
        let yPos = 150;
        let tb = new TextButton(this.game, this.game.world.centerX, yPos, {
            text : 'Join',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.playClick()});
        yPos += tb.height + 10;

        let optionsB = new TextButton(this.game, this.game.world.centerX, yPos , {
            text : 'Create',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.buildClick()});
        yPos += optionsB.height + 10;

        let helpB = new TextButton(this.game, this.game.world.centerX, yPos , {
            text : 'Help',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.helpClick()});
        yPos += helpB.height + 10;

        new TextButton(this.game, this.game.world.centerX, yPos, {
            text : 'Credits',
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {callback : () => this.creditsClick()});
    }

    private playClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.state.start('lobby', true, false, true, Assets.Tilemaps.JungleMap2.getName(), 1));
        this.game.camera.fade(0x000000, 500);
    }

    private joinClick() {
        this.game.camera.onFadeComplete.addOnce(() => {
           Network.acknowledge('lobbies', null, (lobbies) => {
                this.game.state.start('lobby', true, false, false, lobbies[0].id);
           });
        });
        this.game.camera.fade(0x000000, 100);

    }

    private buildClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.state.start('build'), this);
        this.game.camera.fade(0x000000, 500);
    }

    private helpClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.state.start('help'), this);
        this.game.camera.fade(0x000000, 500);
    }

    private creditsClick() {
        this.game.camera.onFadeComplete.addOnce(() => this.state.start('credits'));
        this.game.camera.fade(0x000000, 500);
    }

}