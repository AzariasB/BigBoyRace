"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("p2");
require("pixi");
require("phaser");
const WebFontLoader = require("webfontloader");
const boot_1 = require("./states/boot");
const preloader_1 = require("./states/preloader");
const title_1 = require("./states/title");
const game_1 = require("./states/game");
const lobby_1 = require("./states/lobby");
const Utils = require("./utils/utils");
const Assets = require("./assets");
class App extends Phaser.Game {
    constructor(config) {
        super(config);
        this.state.add('boot', boot_1.default);
        this.state.add('preloader', preloader_1.default);
        this.state.add('title', title_1.default);
        this.state.add('game', game_1.default);
        this.state.add('lobby', lobby_1.default);
        this.state.start('boot');
    }
}
function startApp() {
    let gameWidth = DEFAULT_GAME_WIDTH;
    let gameHeight = DEFAULT_GAME_HEIGHT;
    if (SCALE_MODE === 'USER_SCALE') {
        let screenMetrics = Utils.ScreenUtils.calculateScreenMetrics(gameWidth, gameHeight);
        gameWidth = screenMetrics.gameWidth;
        gameHeight = screenMetrics.gameHeight;
    }
    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig = {
        width: gameWidth,
        height: gameHeight,
        renderer: Phaser.AUTO,
        parent: '',
        disableVisibilityChange: true,
        resolution: 1
    };
    let app = new App(gameConfig);
}
window.onload = () => {
    let webFontLoaderOptions = null;
    let webFontsToLoad = GOOGLE_WEB_FONTS;
    if (webFontsToLoad.length > 0) {
        webFontLoaderOptions = (webFontLoaderOptions || {});
        webFontLoaderOptions.google = {
            families: webFontsToLoad
        };
    }
    if (Object.keys(Assets.CustomWebFonts).length > 0) {
        webFontLoaderOptions = (webFontLoaderOptions || {});
        webFontLoaderOptions.custom = {
            families: [],
            urls: []
        };
        for (let font in Assets.CustomWebFonts) {
            webFontLoaderOptions.custom.families.push(Assets.CustomWebFonts[font].getFamily());
            webFontLoaderOptions.custom.urls.push(Assets.CustomWebFonts[font].getCSS());
        }
    }
    if (webFontLoaderOptions === null) {
        // Just start the game, we don't need any additional fonts
        startApp();
    }
    else {
        // Load the fonts defined in webFontsToLoad from Google Web Fonts, and/or any Local Fonts then start the game knowing the fonts are available
        webFontLoaderOptions.active = startApp;
        WebFontLoader.load(webFontLoaderOptions);
    }
};
//# sourceMappingURL=app.js.map