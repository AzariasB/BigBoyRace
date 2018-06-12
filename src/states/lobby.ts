
import { Network } from '../network';
import {CustomWebFonts} from '../assets';
import BackgroundScroller from '../widgets/backgroundScroller';
import TextButton from '../widgets/TextButton';

export default class Lobby extends Phaser.State {

    private text: Phaser.Text;

    public create(): void {
        new BackgroundScroller(this.game);
        Network.initialize();

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


        Network.when('connected').addOnce(() => {
            this.text.text = 'Waiting for player...';
        });

        Network.when('start').addOnce(() => {
            console.log('received start');
            this.state.start('game');
        });
    }

    private cancelConnection(): void {
        Network.disconnect();
        this.state.start('title');
    }
}