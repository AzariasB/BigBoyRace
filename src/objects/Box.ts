import * as Assets from '../assets';


export default class Box extends Phaser.Sprite {

    private isCollected: boolean;

    constructor (game: Phaser.Game, x: number, y: number, group: string) {
        super(game, x, y, group);
        this.game.physics.arcade.enableBody(this);
        this.anchor.set(0.5, 0.5);
    }

    update() {
        super.update();
        if (this.isCollected) {
            this.rotation += Math.PI / 20;
            this.alpha -= 1 * this.game.time.elapsed / 1000;
            this.scale.divide(1.01, 1.01);
            if (this.alpha <= 0)this.destroy();
        }
    }

    public collect(target: Phaser.Sprite): void {
        this.isCollected = true;
        let body: Phaser.Physics.Arcade.Body = this.body;
        body.destroy();
    }
}
