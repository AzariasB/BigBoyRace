import * as Assets from '../assets';
import { Player } from '../objects/Player';
import Box from '../objects/Box';
import BackgroundScroller from '../widgets/backgroundScroller';
import { Network } from '../network';
import ItemHolder from '../objects/ItemHolder';
import { PLAYER_FIRSTJUMP, PLAYER_JUMPTIME_MS, PLAYER_JUMP, N_MAX_DISTANE, N_PLAYERS, N_INPUT } from '../constant';
import { PlayerDirection, PlayerStates } from '../PlayerAnimation';
import TextButton from '../widgets/TextButton';

export default class Game extends Phaser.State {
    private myId: number;
    private players: Player[];
    private player: Player;
    private tilemap: Phaser.Tilemap = null;
    private collisionLayer: Phaser.TilemapLayer = null;
    private cursors: Phaser.CursorKeys = null;
    private backgrounds: Phaser.TileSprite[] = [];
    private boxes: {[key: number]: Box} = {};
    private particlesGenerator: Phaser.Particles.Arcade.Emitter = null;
    private jumptimer = 0;
    private finishTrigger: Phaser.Sprite;
    private collectedBoxes: number[];
    private currentRound: number;

    public create(): void {
        this.collectedBoxes = [];
        for (let name of BackgroundScroller.BG_NAMES) {
            let bg = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.height, name);
            bg.scale.set(2, 2);
            this.backgrounds.push(bg);
        }

        this.particlesGenerator = this.game.add.emitter(0, 0, 100);
        this.particlesGenerator.setAlpha(1, 0, 900);
        this.particlesGenerator.makeParticles(Assets.Images.ImagesBox.getName());
        this.particlesGenerator.minParticleScale = 0.3;
        this.particlesGenerator.maxParticleScale = 0.3;

        this.tilemap = this.game.add.tilemap(Assets.Tilemaps.JungleMap2.getName());

        this.tilemap.addTilesetImage(Assets.Images.TilesetsJungle.getName());
        this.tilemap.setCollisionByExclusion([], true, 'Collision');
        this.tilemap.createLayer('Background');
        this.collisionLayer = this.tilemap.createLayer('Collision');
        this.collisionLayer.resizeWorld();
        for (let bg of this.backgrounds) {
            bg.width = this.world.width;
            bg.height = this.world.height;
        }

        // this.player.setTexture(bitmap.texture);
        // this.player.jump();
        // this.game.add.existing(this.ennemy);

        let startPos: Phaser.Point = new Phaser.Point();
        this.tilemap.objects['Powerups'].map(o => {
            if (o.name === 'item') {
                console.log(o);
                let nwBox  = new Box(this.game, o.x + this.tilemap.tileWidth / 2, o.y + this.tilemap.tileHeight / 2, Assets.Images.ImagesBox.getName());
                this.boxes[Phaser.Math.random(0, 100)] = nwBox;
                nwBox.body.allowGravity = false;
                nwBox.height = this.tilemap.tileHeight;
                nwBox.width = this.tilemap.tileWidth;
                this.game.add.existing(nwBox);

            } else if (o.name === 'start') {
                startPos.set(o.x, o.y);
            } else if (o.name === 'finish') {
                this.finishTrigger = this.game.add.sprite(o.x, o.y);
                this.game.physics.enable(this.finishTrigger);
                let arcade: Phaser.Physics.Arcade.Body = this.finishTrigger.body;
                arcade.allowGravity = false;
                arcade.gravity.set(0, 0);
                arcade.setSize(o.width, o.height);
            }
        });

        this.players = [];
        for (let i = 0; i < N_PLAYERS; ++i ) {
            let p = new Player(i !== this.myId, this.game, startPos.x, startPos.y, Assets.Spritesheets.Hero2.getName(), this.tilemap, this.collisionLayer);
            this.players.push(p);
            this.game.add.existing(p);
            if (i === this.myId) {
                this.player = p;
            }
        }
        this.player.bringToTop();


        this.game.sound.play(Assets.Audio.AudioMusic.getName(), 0.2, true);
        this.game.camera.follow(this.player);

        this.cursors = this.game.input.keyboard.createCursorKeys();

        let itemholder = new ItemHolder(this.game, 50, 50, Assets.Atlases.AtlasesBlueSheet.getName(), Assets.Atlases.AtlasesBlueSheet.Frames.BlueButton09);
        this.game.add.existing(itemholder);
        this.tilemap.createLayer('Foreground');

        Network.when('update').add((_, data) => this.updateState(data) );
        this.game.time.events.loop(15, () => this.sendUpdate());
    }

    private sendUpdate() {
        let data = {
            id: this.myId,
            player: this.player.serialize()
        };
        Network.send('update', data);
    }

    private updateState(data) {
        if (data.id !== this.myId) {
            let p = data.player;
            this.players[data.id].deserialize(p);
        }
    }

    private toRank(num: number): string {
        let unit = num % 10;
        switch (unit) {
            case 1: return num + 'st';
            case 2: return num + 'nd';
            case 4: return num + 'rd';
            default: return num + 'th';
        }
    }

    private finished() {
        this.finishTrigger.destroy();
        this.player.finished = true;

        let txt = this.game.add.text(this.game.width / 2  , this.game.height / 2 , 'Finished !', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 35
        });
        txt.anchor.set(0.5);
        let rank = this.players.filter(p => p !== this.player && p.finished).length + 1;
        let rankTt = this.game.add.text(this.game.width / 2  , this.game.height / 2 + txt.height , 'Rank : ' + this.toRank(rank), {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 30
        });
        rankTt.anchor.set(0.5, 0.5);
    }


    public update(): void {
        super.update(this.game);

        for (let p of this.players) {
            this.game.physics.arcade.collide(p, this.collisionLayer);
        }

        if (this.game.physics.arcade.overlap(this.player, this.finishTrigger)) {
            this.finished();
        }

        // send player data to server

        let divisor = 4;
        for (let bg of this.backgrounds) {
            bg.x = this.game.camera.x / divisor;
            divisor << 1;
        }



        if (this.cursors.up.justDown && this.player.sm.is(PlayerStates.WallSliding)) {
            this.player.setJumping(true);
        }
        else if (this.cursors.up.isDown && this.player.arcadeBody.onFloor() && this.player.sm.isOneOf(PlayerStates.Running, PlayerStates.Idle) && this.jumptimer === 0) {
            this.jumptimer = 1;
            this.game.time.events.add(PLAYER_JUMPTIME_MS, () => this.jumptimer = 0);
            this.player.arcadeBody.velocity.y = - PLAYER_JUMP;
        }
        else if (this.cursors.up.isDown && (this.jumptimer !== 0)) {
            this.player.body.velocity.y = - PLAYER_JUMP;
        }
        else if (this.jumptimer !== 0) {
            this.jumptimer = 0;
        }

        this.player.setCrouching(this.cursors.down.isDown);
        let ti = this.cursors.up.timeDown;

        if (this.cursors.left.isDown) {
            this.player.goDirection(PlayerDirection.Left);
        } else if (this.cursors.right.isDown) {
            this.player.goDirection(PlayerDirection.Right);
        }

        if (this.cursors.left.isUp && this.cursors.right.isUp && this.player.arcadeBody.onFloor()) {
            this.player.stop();
        }
        else if (this.cursors.left.isUp && this.cursors.right.isUp && this.player.sm.is(PlayerStates.Jumping) ) {
            this.player.direction = PlayerDirection.None;
        }
        if (this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).justDown) {
            this.player.useItem();
        }
    }
}
