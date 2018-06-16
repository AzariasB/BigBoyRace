import * as Assets from '../assets';
import { Powerup } from './powerups/Powerup';
import { Player } from './Player';
import { getTint } from '../utils/colorUtils';


export default class ItemHolder extends Phaser.Group {

    private containing: Powerup = null;

    constructor (private player: Player,
                private xOffset: number,
                private yOffset: number) {
        super(player.game, player.game.world);
        let background: Phaser.Sprite = null;

        this.add(background = new Phaser.Sprite(
            this.game,
            xOffset, yOffset,
            Assets.Atlases.AtlasesGreySheet.getName(),
            Assets.Atlases.AtlasesGreySheet.Frames.GreyButton11
        ));
        background.anchor.set(0.5, 0.5);
        background.tint = getTint(this.game.state.states['game'].myId);

        this.fixedToCamera = true;
    }


    public setItem(powerup: Powerup) {
        this.containing = powerup;
        if (powerup.width > this.width) powerup.width = this.width - 10;
        if (powerup.height > this.height) powerup.height = this.height - 10;
        powerup.fixedToCamera = true;
        powerup.cameraOffset.set(this.xOffset, this.yOffset);
        this.game.add.existing(powerup);
    }

    public hasPowerup() {
        return this.containing !== null;
    }

    public activatePowerup() {
        if (this.containing === null) return;

        this.containing.activate(this.player);
        this.removeItem();
    }

    public removeItem() {
        if (!this.containing) return;

        this.containing.destroy(true);
        this.containing = null;
    }

}
