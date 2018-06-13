"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Shield extends Phaser.Sprite {
    constructor(game, x, y, group) {
        super(game, x, y, group);
        this.target = null;
        this.game.physics.arcade.enableBody(this);
        this.scale = new Phaser.Point(1.5, 1.5);
        this.multiplier = 1;
        this.minY = this.y - this.height / 2;
        this.maxY = this.y + this.height / 2;
        this.anchor.set(0.5, 0.5);
    }
    update() {
        super.update();
        if (!this.isCollected) {
            if (this.y >= this.maxY)
                this.multiplier = -1;
            else if (this.y <= this.minY)
                this.multiplier = 1;
            this.y += this.multiplier * 0.01 * this.game.time.elapsed;
        }
        else {
            this.rotation += Math.PI / 20;
            this.alpha -= 1 * this.game.time.elapsed / 1000;
            this.scale.divide(1.01, 1.01);
            if (this.alpha <= 0)
                this.destroy();
        }
    }
    collect(target) {
        this.isCollected = true;
        let body = this.body;
        body.destroy();
        this.target = target;
    }
}
exports.default = Shield;
//# sourceMappingURL=Shield.js.map