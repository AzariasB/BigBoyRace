import * as Assets from '../assets';


export default class Box extends Phaser.Sprite {

    private maxY: number;
    private minY: number;
    private multiplier: number;
    private isCollected: boolean;
    private target: Phaser.Sprite = null;

    constructor (game: Phaser.Game, x: number, y: number, group: string) {
        super(game, x, y, group);
        this.game.physics.arcade.enableBody(this);
        this.scale = new Phaser.Point(1.5, 1.5);
        this.multiplier = 1;
        this.minY = this.y - this.height / 2;
        this.maxY = this.y + this.height / 2;
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
        this.target = target;
    }
}
