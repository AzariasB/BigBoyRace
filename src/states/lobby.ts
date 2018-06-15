
import { Network } from '../network';
import {CustomWebFonts} from '../assets';
import BackgroundScroller from '../widgets/backgroundScroller';
import TextButton from '../widgets/TextButton';
import * as Assets from '../assets';
import Game from './game';

export default class Lobby extends Phaser.State {

    private text: Phaser.Text;

    public init(selectedCreating: boolean, selectedMapOrLobby: string|number, selectedPlayers?: number): void {
        let mapName, playerId, playersNumber;
        new BackgroundScroller(this.game);

        this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Connecting ...', {
            font : CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        });

        new TextButton(this.game, this.game.world.centerX, this.game.world.height * 3 / 4, {
            text : 'Cancel',
            font : CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {
            callback : this.cancelConnection,
            callbackContext : this
        });

        this.text.anchor.set(0.5, 0.5);


        Network.when('welcome').addOnce((_, data) => {
            playerId = data.id;
            mapName = data.map;
            playersNumber = data.playersNumber;
            this.text.text = 'Waiting for players...';
        });

        Network.when('start').addOnce(() => {
            this.state.start('game', true, false, playerId, mapName, playersNumber);
        });

        if (selectedCreating) {
            Network.send('create', {
                map: selectedMapOrLobby,
                players: selectedPlayers
            });
        } else {
            Network.send('join', selectedMapOrLobby);
        }
    }

    private cancelConnection(): void {
        Network.send('quit');
        this.state.start('title');
    }
}