"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GlueArea_1 = require("./powerups/GlueArea");
class Box extends Phaser.Sprite {
    constructor(game, x, y, group) {
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
            if (this.alpha <= 0)
                this.destroy();
        }
    }
    collect(target) {
        this.target = target;
        this.isCollected = true;
        this.target.setItem(new GlueArea_1.GlueArea(this.game, 50, 50));
        let body = this.body;
        body.destroy();
    }
}
exports.default = Box;
//# sourceMappingURL=Box.js.map