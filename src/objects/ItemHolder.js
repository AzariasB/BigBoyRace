"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ItemHolder extends Phaser.Sprite {
    constructor(game, x, y, group, frame) {
        super(game, x, y, group, frame);
        this.scale = new Phaser.Point(1.5, 1.5);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = true;
    }
}
exports.default = ItemHolder;
//# sourceMappingURL=ItemHolder.js.map