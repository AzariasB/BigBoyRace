import * as Assets from '../assets';
import { Boost } from './powerups/Boost';
import { GlueArea } from './powerups/GlueArea';
import { Player } from './Player';


export default class Box extends Phaser.Sprite {

    private isCollected: boolean;
    private target: Player;

    constructor (game: Phaser.Game, x: number, y: number, group: string) {
        super(game, x, y, group);
        this.game.physics.arcade.enableBody(this);
        this.anchor.set(0.5, 0.5);
    }

    update() {
        super.update();
        if (this.isCollected) {
            this.game.add.existing(this.target.getItem());
            this.rotation += Math.PI / 20;
            this.alpha -= 1 * this.game.time.elapsed / 1000;
            this.scale.divide(1.01, 1.01);
            if (this.alpha <= 0)this.destroy();
        }
    }

    public collect(target: Player): void {
        this.target = target;
        this.isCollected = true;
        this.target.setItem(new GlueArea(this.game, 50, 50));
        let body: Phaser.Physics.Arcade.Body = this.body;
        body.destroy();
    }
}
