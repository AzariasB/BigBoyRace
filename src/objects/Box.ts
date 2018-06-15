import * as Assets from '../assets';
import { Boost } from './powerups/Boost';
import { GlueArea } from './powerups/GlueArea';
import { IceArea } from './powerups/IceArea';
import { Player } from './Player';
import { BoostArea} from './powerups/BoostArea';


export default class Box extends Phaser.Sprite {

    private isCollected: boolean;

    constructor (public readonly id: number,
        game: Phaser.Game,
        x: number,
        y: number,
        spriteName: string,
        private onFinishCallback = (_: Box) => {}
    ) {
        super(game, x, y, spriteName);
        this.game.physics.arcade.enableBody(this);
        this.anchor.set(0.5, 0.5);
    }

    update() {
        super.update();
        if (this.isCollected) {
            this.rotation += Math.PI / 20;
            this.alpha -= 1 * this.game.time.elapsed / 1000;
            this.scale.divide(1.01, 1.01);
            if (this.alpha <= 0) {
                this.destroy();
                this.onFinishCallback(this);
            }
        }
    }

    public collect(target: Player = null): void {
        this.isCollected = true;

        if (target !== null) {
            let item = new BoostArea(this.game.state.states['game'], 50, 50);
            target.setItem(item);
        }
        let body: Phaser.Physics.Arcade.Body = this.body;
        body.destroy();
    }
}
