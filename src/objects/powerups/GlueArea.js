"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Powerup_1 = require("./Powerup");
const Assets = require("../../assets");
class GlueArea extends Powerup_1.Powerup {
    constructor(game, x, y) {
        super(game, x, y, Assets.Images.ImagesGlue.getName());
        this.scale = new Phaser.Point(1.5, 1.5);
        this.anchor.set(0.5, 0.5);
        this.fixedToCamera = true;
    }
    makeSound() {
    }
    activate() {
        console.log('activate GlueArea');
    }
}
exports.GlueArea = GlueArea;
//# sourceMappingURL=GlueArea.js.map