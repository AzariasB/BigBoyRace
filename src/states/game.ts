import * as Assets from '../assets';
import { Player } from '../objects/Player';
import Box from '../objects/Box';
import BackgroundScroller from '../widgets/backgroundScroller';
import { Network } from '../network';
import ItemHolder from '../objects/ItemHolder';
import { PLAYER_FIRSTJUMP, PLAYER_JUMPTIME_MS, PLAYER_JUMP, N_MAX_DISTANE, N_PLAYERS } from '../constant';
import { PlayerDirection, PlayerStates } from '../PlayerAnimation';

export default class Game extends Phaser.State {
    private sfxAudiosprite: Phaser.AudioSprite = null;
    private myId: number;
    private players: Player[];
    private player: Player;
    private tilemap: Phaser.Tilemap = null;
    private collisionLayer: Phaser.TilemapLayer = null;
    private cursors: Phaser.CursorKeys = null;
    private backgrounds: Phaser.TileSprite[] = [];
    private box: Box[] = [];
    private particlesGenerator: Phaser.Particles.Arcade.Emitter = null;
    private ennemy: Player = null;
    private jumptimer = 0;
    private gameWorld;

    public create(): void {
        for (let name of BackgroundScroller.BG_NAMES) {
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
                let nwBox;
                this.box.push(nwBox = new Box(this.game, o.x + this.tilemap.tileWidth / 2, o.y + this.tilemap.tileHeight / 2, Assets.Images.ImagesBox.getName()));
                nwBox.body.gravity = 0;
                nwBox.height = this.tilemap.tileHeight;
                nwBox.width = this.tilemap.tileWidth;
                this.game.add.existing(nwBox);

            } else if (o.name === 'start') {
                startPos.set(o.x, o.y);
            }
        });

        this.players = [];
        for (let i = 0; i < N_PLAYERS; ++i ) {
            let p = new Player(this.players.length, this.game, startPos.x, startPos.y, Assets.Spritesheets.Adventurer.getName(), this.tilemap, this.collisionLayer);
            this.players.push(p);
            this.game.add.existing(p);
            if (p.id === this.myId) {
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

        Network.when('state').add((_, data) => this.updateState(data) );
    }

    private updateState(data) {
        for (let p of data) {
            let dist = Phaser.Point.distance({x: p.x, y: p.y}, this.players[p.id].position);
            if (dist > N_MAX_DISTANE) {
                this.players[p.id].position.set(p.x, p.y);
                this.players[p.id].body.velocity.set(p.vx, p.vy);
            }
        }
    }

    public update(): void {
        Network.send('inputs', new Int8Array([
            +this.cursors.up.isDown,
            +this.cursors.right.isDown,
            +this.cursors.down.isDown,
            +this.cursors.left.isDown,
            +this.game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)
        ]));
        for (let p of this.players) {
            this.game.physics.arcade.collide(this.player, this.collisionLayer);
            p.update();
        }
        // this.game.physics.arcade.collide(this.ennemy, this.collisionLayer);
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
