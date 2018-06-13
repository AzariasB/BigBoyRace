"use strict";
/*
    The Screen[...] classes are modified versions of the classes in an article I found.

    Author: Tomáš Rychnovský
    Article: http://sbcgamesdev.blogspot.ca/2015/04/phaser-tutorial-manage-different-screen.html
    Date: Thursday, April 9, 2015

    Big thanks to Tomáš!
 */
Object.defineProperty(exports, "__esModule", { value: true });
var ScreenOrientation;
(function (ScreenOrientation) {
    ScreenOrientation[ScreenOrientation["PORTRAIT"] = 0] = "PORTRAIT";
    ScreenOrientation[ScreenOrientation["LANDSCAPE"] = 1] = "LANDSCAPE";
})(ScreenOrientation = exports.ScreenOrientation || (exports.ScreenOrientation = {}));
class ScreenMetrics {
}
exports.ScreenMetrics = ScreenMetrics;
class ScreenUtils {
    static calculateScreenMetrics(defaultWidth, defaultHeight, orientation = ScreenOrientation.LANDSCAPE, maxGameWidth, maxGameHeight) {
        // Just to give some explanation as to the numbers and colors in the included background;
        // The GREEN is the safe area and will be displayed fully on any device and is based on 16:10 aspect ratio, build your actual gameplay here
        // The YELLOW is the extra area that will be visible on devices with a 3:2 aspect ratio (iPhone 4S and below)
        // The BLUE is the extra area that will be visible on devices with a 4:3 aspect ratio (iPads)
        // The RED is the extra area that will be visible on devices with a 16:9 aspect ratio (iPhone 5 and above) (this is probably the most common ratio overall...)
        // The GREY area will most likely never be seen, unless some device has a really odd aspect ratio (and with Android, I wouldn't be surprised if there is a few out there)
        this.screenMetrics = new ScreenMetrics();
        this.screenMetrics.windowWidth = window.innerWidth;
        this.screenMetrics.windowHeight = window.innerHeight;
        this.screenMetrics.defaultGameWidth = defaultWidth;
        this.screenMetrics.defaultGameHeight = defaultHeight;
        // Swap width and height if necessary to match the specified orientation
        let dimensionsOppositeForLandscape = ((this.screenMetrics.windowWidth < this.screenMetrics.windowHeight) && orientation === ScreenOrientation.LANDSCAPE);
        let dimensionsOppositeForPortrait = ((this.screenMetrics.windowHeight < this.screenMetrics.windowWidth) && orientation === ScreenOrientation.PORTRAIT);
        if (dimensionsOppositeForLandscape || dimensionsOppositeForPortrait) {
            [this.screenMetrics.windowWidth, this.screenMetrics.windowHeight] = [this.screenMetrics.windowHeight, this.screenMetrics.windowWidth];
        }
        // Calculate the max width and max height if not provided; ratios are based off iPad (4:3) and iPhone 5+ (16:9) as the extremes in both width and height
        if (!maxGameWidth || !maxGameHeight) {
            if (orientation === ScreenOrientation.LANDSCAPE) {
                this.screenMetrics.maxGameWidth = Math.round(this.screenMetrics.defaultGameWidth * (MAX_GAME_WIDTH / DEFAULT_GAME_WIDTH));
                this.screenMetrics.maxGameHeight = Math.round(this.screenMetrics.defaultGameHeight * (MAX_GAME_HEIGHT / DEFAULT_GAME_HEIGHT));
            }
            else {
                this.screenMetrics.maxGameWidth = Math.round(this.screenMetrics.defaultGameWidth * (MAX_GAME_HEIGHT / DEFAULT_GAME_HEIGHT));
                this.screenMetrics.maxGameHeight = Math.round(this.screenMetrics.defaultGameHeight * (MAX_GAME_WIDTH / DEFAULT_GAME_WIDTH));
            }
        }
        else {
            this.screenMetrics.maxGameWidth = maxGameWidth;
            this.screenMetrics.maxGameHeight = maxGameHeight;
        }
        let defaultAspectRatio = ((orientation === ScreenOrientation.LANDSCAPE) ? (DEFAULT_GAME_WIDTH / DEFAULT_GAME_HEIGHT) : (DEFAULT_GAME_HEIGHT / DEFAULT_GAME_WIDTH));
        let windowAspectRatio = (this.screenMetrics.windowWidth / this.screenMetrics.windowHeight);
        if (windowAspectRatio > defaultAspectRatio) {
            this.screenMetrics.gameHeight = this.screenMetrics.defaultGameHeight;
            this.screenMetrics.gameWidth = (Math.ceil((this.screenMetrics.gameHeight * windowAspectRatio) * 0.5) * 2);
            this.screenMetrics.gameWidth = Math.min(this.screenMetrics.gameWidth, this.screenMetrics.maxGameWidth);
            this.screenMetrics.offsetX = ((this.screenMetrics.gameWidth - this.screenMetrics.defaultGameWidth) * 0.5);
            this.screenMetrics.offsetY = 0;
        }
        else {
            this.screenMetrics.gameWidth = this.screenMetrics.defaultGameWidth;
            this.screenMetrics.gameHeight = (Math.ceil((this.screenMetrics.gameWidth / windowAspectRatio) * 0.5) * 2);
            this.screenMetrics.gameHeight = Math.min(this.screenMetrics.gameHeight, this.screenMetrics.maxGameHeight);
            this.screenMetrics.offsetX = 0;
            this.screenMetrics.offsetY = ((this.screenMetrics.gameHeight - this.screenMetrics.defaultGameHeight) * 0.5);
        }
        // Calculate scaling
        this.screenMetrics.scaleX = (this.screenMetrics.windowWidth / this.screenMetrics.gameWidth);
        this.screenMetrics.scaleY = (this.screenMetrics.windowHeight / this.screenMetrics.gameHeight);
        return this.screenMetrics;
    }
}
exports.ScreenUtils = ScreenUtils;
class StringUtils {
    static toCamelCase(str) {
        return str.replace(/[^A-Za-z0-9]/g, ' ').replace(/^\w|[A-Z]|\b\w|\s+/g, function (match, index) {
            if (+match === 0 || match === '-' || match === '.') {
                return '';
            }
            return (index === 0 ? match.toLowerCase() : match.toUpperCase());
        });
    }
    static toPascalCase(str) {
        let camelCase = StringUtils.toCamelCase(str);
        return (camelCase[0].toUpperCase() + camelCase.substr(1));
    }
}
exports.StringUtils = StringUtils;
//# sourceMappingURL=utils.js.map