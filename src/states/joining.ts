import { Network } from '../network';
import BackgroundScroller from '../widgets/backgroundScroller';
import * as Assets from '../assets';
import TextButton from '../widgets/TextButton';


export default class Joining extends Phaser.State {

    private static readonly MAX_ROWS = 5;

    create() {
        new BackgroundScroller(this.game);

        this.game.add.text(this.game.world.centerX, 5, 'Joining', {
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 30
        }).anchor.set(0.5, 0);

        new TextButton(this.game, 100, 30, {
            text: 'Menu',
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        }, {callback: () => this.state.start('title')});

        Network.acknowledge('lobbies', null, lobbies => this.showLobbies(lobbies));
    }

    private showLobbies(lobbies: any[]) {

        if (lobbies.length === 0) {
            this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'No lobbies found', {
                font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 25
            }).anchor.set(0.5, 0.5);
        } else {
            lobbies.map((l, i) => this.createLobby(l, i));
        }

    }

    private createLobby(lobyData: any, index: number) {
        let colum = 0;
        colum += Math.floor(index / Joining.MAX_ROWS);
        index -= Joining.MAX_ROWS * colum;

        new TextButton(this.game, (colum + 1) * 250, (index + 3) * 60, {
            text: 'Lobby ' + lobyData.id,
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        }, {callback: () => this.state.start('lobby', true, false, false, lobyData.id)});
    }
}