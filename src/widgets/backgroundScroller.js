"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assets_1 = require("../assets");
class BackgroundScroller {
    static get BG_NAMES() {
        return [
            assets_1.Images.ImagesPlx1.getName(),
            assets_1.Images.ImagesPlx2.getName(),
            assets_1.Images.ImagesPlx3.getName(),
            assets_1.Images.ImagesPlx4.getName(),
            assets_1.Images.ImagesPlx5.getName()
        ];
    }
    constructor(game) {
        for (let i = 0; i < BackgroundScroller.BG_NAMES.length; ++i) {
            let name = BackgroundScroller.BG_NAMES[i];
            let img = game.cache.getImage(name);
            let bg = game.add.tileSprite(0, 0, game.world.width, game.height, name);
            bg.scale.set(game.height / img.height, game.height / img.height);
            bg.autoScroll(-2 * (i + 1), 0);
        }
    }
}
exports.default = BackgroundScroller;
//# sourceMappingURL=backgroundScroller.js.map