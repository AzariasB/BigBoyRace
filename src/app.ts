import 'p2';
import 'pixi';
import 'phaser';

import * as WebFontLoader from 'webfontloader';
import * as io from 'socket.io';

import BootState from './states/bootState';
import PreloaderState from './states/preloaderState';
import TitleState from './states/titleState';
import GameState from './states/gameState';
import LobbyState from './states/lobbyState';
import CreditsState from './states/creditsState';
import HelpState from './states/helpState';
import CreateState from './states/createState';
import JoiningState from './states/joiningState';
import * as Utils from './utils/utils';
import * as Assets from './assets';
import { Game } from 'phaser-ce';

class App extends Phaser.Game {

    constructor(config: Phaser.IGameConfig) {
        super (config);
        this.state.add('boot', BootState);
        this.state.add('preloader', PreloaderState);
        this.state.add('title', TitleState);
        this.state.add('game', GameState);
        this.state.add('lobby', LobbyState);
        this.state.add('create', CreateState);
        this.state.add('help', HelpState);
        this.state.add('credits', CreditsState);
        this.state.add('joining', JoiningState);

        this.state.start('boot');
    }

}

function startApp(): void {
    let gameWidth: number = DEFAULT_GAME_WIDTH;
    let gameHeight: number = DEFAULT_GAME_HEIGHT;


    if (SCALE_MODE === 'USER_SCALE') {
        let screenMetrics: Utils.ScreenMetrics = Utils.ScreenUtils.calculateScreenMetrics(gameWidth, gameHeight);

        gameWidth = screenMetrics.gameWidth;
        gameHeight = screenMetrics.gameHeight;
    }

    // There are a few more options you can set if needed, just take a look at Phaser.IGameConfig
    let gameConfig: Phaser.IGameConfig = {
        width: gameWidth,
        height: gameHeight,
        renderer: Phaser.AUTO,
        parent: '',
        disableVisibilityChange : true,
        resolution: 1
    };

    let app = new App(gameConfig);
}

window.onload = () => {
    let webFontLoaderOptions: any = null;
    let webFontsToLoad: string[] = GOOGLE_WEB_FONTS;

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
    } else {
        // Load the fonts defined in webFontsToLoad from Google Web Fonts, and/or any Local Fonts then start the game knowing the fonts are available
        webFontLoaderOptions.active = startApp;

        WebFontLoader.load(webFontLoaderOptions);
    }
};
