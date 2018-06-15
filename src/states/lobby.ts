
import { Network } from '../network';
import {CustomWebFonts} from '../assets';
import BackgroundScroller from '../widgets/backgroundScroller';
import TextButton from '../widgets/TextButton';

export default class Lobby extends Phaser.State {

    private text: Phaser.Text;

    public init(selectedCreating: boolean,
                selectedMapOrLobby: string|number,
                selectedPlayers?: number,
                selectedRounds?: number): void {
        let mapName, playerId, playersNumber, roundNumber;
        new BackgroundScroller(this.game);

        this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Connecting ...', {
            font : CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        });

        this.game.add.existing(new TextButton(this.game, this.game.world.centerX, this.game.world.height * 3 / 4, {
            text : 'Cancel',
            font : CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 20
        }, {
            callback : this.cancelConnection,
            callbackContext : this
        }));

        this.text.anchor.set(0.5, 0.5);


        Network.when('welcome').addOnce((_, data) => {
            playerId = data.id;
            mapName = data.config.map;
            playersNumber = data.config.playersNumber;
            roundNumber = data.config.rounds;
            this.text.text = 'Waiting for players...';

            this.game.add.text(this.world.centerX, 10, 'Lobby ' + data.lobbyId, {
                font: CustomWebFonts.FontsKenvectorFuture.getName(),
                fontSize: 20
            }).anchor.set(0.5, 0);
        });

        Network.when('start').addOnce(() => {
            this.state.start('game', true, false, playerId, mapName, playersNumber, roundNumber);
        });

        if (selectedCreating) {
            Network.send('create', {
                map: selectedMapOrLobby,
                playersNumber: selectedPlayers,
                rounds: selectedRounds
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