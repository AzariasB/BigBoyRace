"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assets_1 = require("../assets");
let defaultButton = {
    key: assets_1.Atlases.AtlasesBlueSheet.getName(),
    over: assets_1.Atlases.AtlasesBlueSheet.Frames.BlueButton04,
    out: assets_1.Atlases.AtlasesBlueSheet.Frames.BlueButton00,
    down: assets_1.Atlases.AtlasesBlueSheet.Frames.BlueButton02
};
class TextButton {
    constructor(game, x, y, text, options = {}) {
        this.game = game;
        Object.keys(defaultButton).map(k => {
            if (!options[k])
                options[k] = defaultButton[k];
        });
        this.button = this.game.add.button(x, y, options.key, options.callback, options.callbackContext, options.over, options.out, options.down, options.up);
        this.button.anchor.set(0.5, 0.5);
        this.text = this.game.add.text(this.button.x, this.button.y, text.text, text);
        this.text.anchor.set(0.5, 0.5);
    }
    get height() {
        return this.button.height;
    }
}
exports.default = TextButton;
//# sourceMappingURL=TextButton.js.map