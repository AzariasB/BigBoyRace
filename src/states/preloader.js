"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Assets = require("../assets");
const AssetUtils = require("../utils/assetUtils");
class Preloader extends Phaser.State {
    constructor() {
        super(...arguments);
        this.preloadBarSprite = null;
        this.preloadFrameSprite = null;
    }
    preload() {
        // Setup your loading screen and preload sprite (if you want a loading progress indicator) here
        this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesArray.getName(), Assets.Atlases.AtlasesPreloadSpritesArray.Frames.PreloadBar);
        // this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesHash.getName(), Assets.Atlases.AtlasesPreloadSpritesHash.Frames.PreloadBar);
        // this.preloadBarSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesXml.getName(), Assets.Atlases.AtlasesPreloadSpritesXml.Frames.PreloadBar);
        this.preloadBarSprite.anchor.setTo(0, 0.5);
        this.preloadBarSprite.x -= this.preloadBarSprite.width * 0.5;
        this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesArray.getName(), Assets.Atlases.AtlasesPreloadSpritesArray.Frames.PreloadFrame);
        // this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesHash.getName(), Assets.Atlases.AtlasesPreloadSpritesHash.Frames.PreloadFrame);
        // this.preloadFrameSprite = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, Assets.Atlases.AtlasesPreloadSpritesXml.getName(), Assets.Atlases.AtlasesPreloadSpritesXml.Frames.PreloadFrame);
        this.preloadFrameSprite.anchor.setTo(0.5);
        this.game.load.setPreloadSprite(this.preloadBarSprite);
        AssetUtils.Loader.loadAllAssets(this.game, this.waitForSoundDecoding, this);
    }
    waitForSoundDecoding() {
        AssetUtils.Loader.waitForSoundDecoding(this.startGame, this);
    }
    startGame() {
        this.game.camera.onFadeComplete.addOnce(this.loadTitle, this);
        this.game.camera.fade(0x000000, 1000);
    }
    loadTitle() {
        this.game.state.start('lobby');
    }
}
exports.default = Preloader;
//# sourceMappingURL=preloader.js.map