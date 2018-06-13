"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TextButton_1 = require("../widgets/TextButton");
const backgroundScroller_1 = require("../widgets/backgroundScroller");
const Assets = require("../assets");
class Title extends Phaser.State {
    create() {
        new backgroundScroller_1.default(this.game);
        let yPos = 150;
        let tb = new TextButton_1.default(this.game, this.game.world.centerX, yPos, {
            text: 'Play !',
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        }, { callback: this.playClick, callbackContext: this });
        yPos += tb.height + 10;
        let optionsB = new TextButton_1.default(this.game, this.game.world.centerX, yPos, {
            text: 'Options',
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        });
        yPos += optionsB.height + 10;
        let helpB = new TextButton_1.default(this.game, this.game.world.centerX, yPos, {
            text: 'Help',
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        });
        yPos += helpB.height + 10;
        new TextButton_1.default(this.game, this.game.world.centerX, yPos, {
            text: 'Credits',
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        });
    }
    playClick() {
        this.game.camera.onFadeComplete.addOnce(this.loadGame, this);
        this.game.camera.fade(0x000000, 1000);
    }
    loadGame() {
        this.game.state.start('lobby');
    }
}
exports.default = Title;
//# sourceMappingURL=title.js.map