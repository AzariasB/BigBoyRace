"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const network_1 = require("../network");
const assets_1 = require("../assets");
const backgroundScroller_1 = require("../widgets/backgroundScroller");
const TextButton_1 = require("../widgets/TextButton");
class Lobby extends Phaser.State {
    create() {
        new backgroundScroller_1.default(this.game);
        network_1.Network.initialize();
        this.text = this.game.add.text(this.game.world.centerX, this.game.world.centerY, 'Connecting ...', {
            font: assets_1.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        });
        new TextButton_1.default(this.game, this.game.world.centerX, this.game.world.height * 3 / 4, {
            text: 'Cancel',
            font: assets_1.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize: 20
        }, {
            callback: this.cancelConnection,
            callbackContext: this
        });
        this.text.anchor.set(0.5, 0.5);
        network_1.Network.when('connected').addOnce(() => {
            this.text.text = 'Waiting for player...';
        });
        network_1.Network.when('start').addOnce(() => {
            console.log('received start');
            this.state.start('game');
        });
    }
    cancelConnection() {
        network_1.Network.disconnect();
        this.state.start('title');
    }
}
exports.default = Lobby;
//# sourceMappingURL=lobby.js.map