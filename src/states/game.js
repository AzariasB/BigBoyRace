"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Assets = require("../assets");
const Player_1 = require("../objects/Player");
const Box_1 = require("../objects/Box");
const backgroundScroller_1 = require("../widgets/backgroundScroller");
const network_1 = require("../network");
const ItemHolder_1 = require("../objects/ItemHolder");
const constant_1 = require("../constant");
const PlayerAnimation_1 = require("../PlayerAnimation");
const chat_1 = require("../widgets/chat");
class Game extends Phaser.State {
    constructor() {
        super(...arguments);
        this.sfxAudiosprite = null;
        this.player = null;
        this.sfxLaserSounds = null;
        this.tilemap = null;
        this.collisionLayer = null;
        this.cursors = null;
        this.backgrounds = [];
        this.box = [];
        this.particlesGenerator = null;
        this.ennemy = null;
    }
    isMantleColor(color) {
        let possibles = ['143,50,50', '171,67,67', '217,87,99'];
        let joined = [color.r, color.g, color.b].join(',');
        return possibles.filter(x => joined === x).length > 0;
    }
    create() {
        for (let name of backgroundScroller_1.default.BG_NAMES) {
            let bg = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.height, name);
            bg.scale.set(2, 2);
            this.backgrounds.push(bg);
        }
        // Network.onReceive('update', (_, data) => this.ennemy.deserialize(data) );
        this.particlesGenerator = this.game.add.emitter(0, 0, 100);
        this.particlesGenerator.setAlpha(1, 0, 900);
        this.particlesGenerator.makeParticles(Assets.Images.ImagesBox.getName());
        this.particlesGenerator.minParticleScale = 0.3;
        this.particlesGenerator.maxParticleScale = 0.3;
        this.tilemap = this.game.add.tilemap(Assets.Tilemaps.JungleMap2.getName());
        let img = this.game.cache.getImage(Assets.Spritesheets.Adventurer.getName());
        let bitmap = this.game.make.bitmapData(img.width, img.height);
        bitmap.load(img);
        bitmap.processPixelRGB(color => {
            if (color.a !== 0 && this.isMantleColor(color)) {
                color.r = 0;
                color.g = 255;
            }
            return color;
        });
        this.tilemap.addTilesetImage(Assets.Images.TilesetsJungle.getName());
        this.tilemap.setCollisionByExclusion([], true, 'Collision');
        this.tilemap.createLayer('Background');
        this.collisionLayer = this.tilemap.createLayer('Collision');
        this.collisionLayer.resizeWorld();
        for (let bg of this.backgrounds) {
            bg.width = this.world.width;
            bg.height = this.world.height;
        }
        this.player = new Player_1.Player(0, this.game, 32, 32, Assets.Spritesheets.Adventurer.getName(), this.tilemap, this.collisionLayer);
        // this.ennemy = new Player(this.game, 32, 32, Assets.Spritesheets.HeroBlue.getName(), this.collisionLayer);
        this.game.add.existing(this.player);
        // this.player.setTexture(bitmap.texture);
        // this.player.jump();
        // this.game.add.existing(this.ennemy);
        this.tilemap.objects['Powerups'].map(o => {
            if (o.name === 'item') {
                let nwBox;
                this.box.push(nwBox = new Box_1.default(this.game, o.x + this.tilemap.tileWidth / 2, o.y + this.tilemap.tileHeight / 2, Assets.Images.ImagesBox.getName()));
                nwBox.body.gravity = 0;
                nwBox.height = this.tilemap.tileHeight;
                nwBox.width = this.tilemap.tileWidth;
                this.game.add.existing(nwBox);
            }
            else if (o.name === 'start') {
                this.player.x = o.x;
                this.player.y = o.y;
            }
        });
        this.game.input.keyboard.createCursorKeys();
        this.sfxAudiosprite = this.game.add.audioSprite(Assets.Audiosprites.AudiospritesSfx.getName());
        // This is an example of how you can lessen the verbosity
        let availableSFX = Assets.Audiosprites.AudiospritesSfx.Sprites;
        this.sfxLaserSounds = [
            availableSFX.Laser1,
            availableSFX.Laser2,
            availableSFX.Laser3,
            availableSFX.Laser4,
            availableSFX.Laser5,
            availableSFX.Laser6,
            availableSFX.Laser7,
            availableSFX.Laser8,
            availableSFX.Laser9
        ];
        this.game.sound.play(Assets.Audio.AudioMusic.getName(), 0.2, true);
        this.game.camera.follow(this.player);
        this.cursors = this.game.input.keyboard.createCursorKeys();
        let itemholder = new ItemHolder_1.default(this.game, 50, 50, Assets.Atlases.AtlasesBlueSheet.getName(), Assets.Atlases.AtlasesBlueSheet.Frames.BlueButton09);
        this.game.add.existing(itemholder);
        let c = new chat_1.default(this.game);
        c.fixedToCamera = true;
        this.game.add.existing(c);
        let timer = this.game.time.create(false);
        // send input to server every 25 ms
        timer.loop(constant_1.N_SEND_INPUTS, () => {
            network_1.Network.send('inputs', new Int8Array([
                +this.cursors.up.isDown,
                +this.cursors.right.isDown,
                +this.cursors.down.isDown,
                +this.cursors.left.isDown,
                +this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
            ]));
        });
        timer.start();
    }
    render() {
        this.game.debug.bodyInfo(this.player, 32, 32);
        this.game.debug.text(this.player.sm.currentStateName, 32, 256);
    }
    update() {
        this.game.physics.arcade.collide(this.player, this.collisionLayer);
        // this.game.physics.arcade.collide(this.ennemy, this.collisionLayer);
        // send player data to server
        let divisor = 4;
        for (let bg of this.backgrounds) {
            bg.x = this.game.camera.x / divisor;
            divisor << 1;
        }
        this.box = this.box.filter(s => {
            s.update();
            let playerOverlap = this.game.physics.arcade.overlap(s, this.player, (s) => {
                this.particlesGenerator.x = s.x;
                this.particlesGenerator.y = s.y;
                this.particlesGenerator.start(true, 1000, null, 10);
                s.collect(this.player);
            });
            /* let ennemyOverlap = this.game.physics.arcade.overlap(s, this.ennemy ,(s) => {
                this.particlesGenerator.x = s.x;
                this.particlesGenerator.y = s.y;
                this.particlesGenerator.start(true, 1000, null, 10);
                s.collect(this.ennemy);
            });
            return !playerOverlap && !ennemyOverlap;*/
            return !playerOverlap;
        });
        this.player.setJumping(this.cursors.up.isDown);
        this.player.setCrouching(this.cursors.down.isDown);
        if (this.cursors.left.justDown) {
            this.player.goDirection(PlayerAnimation_1.PlayerDirection.Left);
        }
        else if (this.cursors.right.justDown) {
            this.player.goDirection(PlayerAnimation_1.PlayerDirection.Right);
        }
        if (this.cursors.left.isUp && this.cursors.right.isUp) {
            this.player.stop();
        }
        this.player.update();
        // this.ennemy.update();
    }
}
exports.default = Game;
//# sourceMappingURL=game.js.map