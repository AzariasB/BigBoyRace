const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let Canvas = require('canvas')
    , window = (new JSDOM(null)).window
    , Phaser;

window.focus = null;
window.scrollTo = function(){};

// expose a few things to all the modules
global.document = window.document;
global.window = window;
global.Canvas = Canvas;
global.Image = Canvas.Image;
window.HTMLCanvasElement.prototype.getContext = function() {
    return {
        fillRect: function() {},
        clearRect: function(){},
        getImageData: function(x, y, w, h) {
            return  {
                data: new Array(w*h*4)
            };
        },
        putImageData: function() {},
        createImageData: function(){ return []},
        setTransform: function(){},
        drawImage: function(){},
        save: function(){},
        fillText: function(){},
        restore: function(){},
        beginPath: function(){},
        moveTo: function(){},
        lineTo: function(){},
        closePath: function(){},
        stroke: function(){},
        translate: function(){},
        scale: function(){},
        rotate: function(){},
        arc: function(){},
        fill: function(){},
    };
}
global.window.CanvasRenderingContext2D = 'foo'; // let Phaser think that we have a canvas
global.window.Element = undefined;
global.navigator = {userAgent: 'Custom'}; // could be anything


// fake the xml http request object because Phaser.Loader uses it
global.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

// load an expose PIXI in order to finally load Phaser
global.PIXI = require('phaser-ce/build/custom/pixi');
global.Phaser = Phaser = require('phaser-ce/build/custom/phaser-arcade-physics');