import * as Assets from '../assets';
import { Player } from '../objects/Player';
import Box from '../objects/Box';
import BackgroundScroller from '../widgets/backgroundScroller';
import { Network } from '../network';
import ItemHolder from '../objects/ItemHolder';
import { PLAYER_FIRSTJUMP, PLAYER_JUMPTIME_MS, PLAYER_JUMP, N_SEND_INPUTS } from '../constant';
import { PlayerDirection, PlayerStates } from '../PlayerAnimation';
import TextButton from '../widgets/TextButton';
import Chat from '../widgets/chat';
import { getTint, getSpriteName } from '../utils/colorUtils';
import { Powerup } from '../objects/powerups/Powerup';
import { EffectArea, EffectName } from '../objects/EffectArea';
import Score from '../widgets/score';

export default class GameState extends Phaser.State {
    private totalRounds;
    private myId: number;
    private players: Player[];
    private player: Player;
    private tilemap: Phaser.Tilemap = null;
    private collisionLayer: Phaser.TilemapLayer = null;
    private cursors: Phaser.CursorKeys = null;
    private backgrounds: Phaser.TileSprite[] = [];
    private boxes: {[key: number]: Box} = {};
    private collidables: Phaser.Group;
    private particlesGenerator: Phaser.Particles.Arcade.Emitter = null;
    private jumptimer = 0;
    private finishTrigger: Phaser.Sprite;
    private currentRound: number = 0;
    private endTexts: Phaser.Text[] = [];
    private networkTimer: Phaser.TimerEvent = null;
    public pauseCapture: boolean = false;
    private itemsOnMap: Phaser.Group;
    private isCountingDown: boolean = true;
    private countdownText: Phaser.Text = null;
    private createdEffects =  {};
    private score: Score;

    public init(id, mapName, players, maxRounds) {
        this.myId = id;
        this.tilemap = this.game.add.tilemap(mapName);
        this.totalRounds = maxRounds;
        this.currentRound =  0;
        for (let name of BackgroundScroller.BG_NAMES) {
            let bg = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.height, name);
            bg.scale.set(2, 2);
            this.backgrounds.push(bg);
        }

        this.isCountingDown = true;
        this.tilemap.addTilesetImage(Assets.Images.TilesetsJungle.getName());
        this.tilemap.setCollisionByExclusion([], true, 'Collision');
        this.tilemap.createLayer('Background');
        this.collisionLayer = this.tilemap.createLayer('Collision');
        this.collisionLayer.resizeWorld();
        this.score = new Score(this.game, this);

        for (let bg of this.backgrounds) {
            bg.width = this.world.width;
            bg.height = this.world.height;
        }

        this.collidables = this.game.add.physicsGroup();
        this.players = [];
        this.createdEffects = {};
        let startPos: Phaser.Point = this.createObjects();

        for (let i = 0; i < players; ++i ) {
            let p = this.createPlayer(i, startPos);
            this.players.push(p);
            this.game.add.existing(p);
            if (i === this.myId) {
                this.player = p;
            }
        }
        this.player.bringToTop();
    }

    private createPlayer(id: number, pos: Phaser.Point) {
        return new Player(id !== this.myId,
                this.game,
                pos.x,
                pos.y,
                getSpriteName(id),
                this.tilemap,
                this.collisionLayer
        );
    }

    public create(): void {
        this.particlesGenerator = this.game.add.emitter(0, 0, 100);
        this.particlesGenerator.setAlpha(1, 0, 900);
        this.particlesGenerator.makeParticles(Assets.Images.ImagesBox.getName());
        this.particlesGenerator.minParticleScale = 0.3;
        this.particlesGenerator.maxParticleScale = 0.3;


        // this.game.sound.play(Assets.Audio.AudioMusic.getName(), 0.2, true);
        this.camera.focusOn(this.player);
        this.camera.follow(this.player, Phaser.Camera.FOLLOW_PLATFORMER);

        this.cursors = this.game.input.keyboard.createCursorKeys();
        this.tilemap.createLayer('Foreground');

        this.countdownText = this.game.add.text(this.centerX, this.centerY, '3', {
            fontSize: 30,
            font: Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
        });
        this.countdownText.anchor.set(0.5, 0.5);
        Network.when('countdown').addOnce((_, value) => this.countdown(value));
        new Chat(this);
    }

    private countdown(value: number) {
        if (value === 0) {
            this.countdownText.text = 'Go !';
            this.time.events.add(1000, () => this.countdownText.destroy());
            this.beginGame();
        } else {
            Network.when('countdown').addOnce((_, value) => this.countdown(value));
            this.countdownText.text = value + '';
        }
    }

    private createBox(id: number, x: number, y: number) {
        return new Box(
            id,
            this.game,
            x + this.tilemap.tileWidth / 2,
            y + this.tilemap.tileHeight / 2,
            Assets.Images.ImagesBox.getName(),
            (box) => delete this.boxes[box.id]
        );
    }

    private beginGame() {
        this.isCountingDown = false;
        Network.clearListener('update');
        Network.when('update').add((_, data) => this.updateState(data) );
        this.networkTimer = this.game.time.events.loop(N_SEND_INPUTS, () => this.sendPlayer());
    }

    private createObjects(): Phaser.Point {
        Object.keys(this.boxes).map(k => this.boxes[k].destroy());
        let firstTime = this.currentRound === 0;

        let pos = new Phaser.Point();
        let id = 0;
        this.tilemap.objects['Powerups'].map(o => {
            if (o.name === 'item') {
                let nwBox  = this.createBox(id, o.x, o.y);
                this.boxes[id] = nwBox;
                nwBox.height = this.tilemap.tileHeight;
                nwBox.width = this.tilemap.tileWidth;
                this.collidables.add(nwBox);
            } else if (o.name === 'start') {
                pos.set(o.x, o.y);
                if (firstTime) {
                    let startFlag = this.game.add.sprite(o.x, o.y, Assets.Spritesheets.Flags.getName(), null, this.collidables);
                    startFlag.animations.add('start', [0, 1, 2, 3]).play(5, true);
                }
            } else if (o.name === 'finish') {
                this.finishTrigger = this.game.add.sprite(o.x, o.y, null, null, this.collidables);
                this.finishTrigger.body.setSize(o.width, o.height);

                if (firstTime) {
                    let arrivalFlag = this.game.add.sprite(o.x, o.y, Assets.Spritesheets.Flags.getName(), null, this.collidables);
                    arrivalFlag.animations.add('finish', [4, 5, 6, 7], 5, true).play();
                }
            }
            ++id;
        });
        return pos;

    }

    private sendUpdate(data: any) {
        Network.send('update', data);
    }

    private sendPlayer() {
        this.sendUpdate({
            id: this.myId,
            player: this.player.serialize()
        });
    }

    private restart() {
        this.endTexts.map(t => t.destroy());
        this.endTexts = [];
        this.score.newRound();
        let start = this.createObjects();
        this.players.map((p, i) =>  {
            p.position.copyFrom(start);
            p.updateTransform();
            p.finished = false;
        });
    }

    public addItemOnMap(effect: EffectName, position: Phaser.Point, broadcastEvent: boolean = true) {
        this.collidables.add(new EffectArea(this, position.x, position.y, effect));
        let effectId = Object.keys(this.createdEffects).length;
        this.createdEffects[effectId] = true;
        if (broadcastEvent) Network.send('update', {author: this.myId, effect, position, effectId});
    }

    private updateState(data) {
        if (data.restart) return this.restart();

        if (data.id !== undefined && data.id !== this.myId) {
            if (data.left) {
                this.players[data.id].destroy();
                this.players.splice(data.id, 1);
            } else {
                let p = data.player;
                this.players[data.id].deserialize(p);

                if (data.player.finished) {
                    this.endScore(data.id);
                }
            }
        } else if (data.boxTaken && this.boxes[data.boxTaken]) {
            this.boxes[data.boxTaken].collect();
        } else if (data.effect && data.author !== this.myId && !this.createdEffects[data.effectId]) {
            this.addItemOnMap(data.effect, data.position, false);
        }
    }

    private endScore(id): void {
        let player = 'White';
        let colors = ['Orange', 'Red', 'Blue', 'Green', 'Black', 'Yellow', 'Purple'];
        if (id < colors.length)
            player = colors[id];
        let rank = this.players.filter(p => p.finished).length;
        this.score.addScore(player, Math.round(this.players.length * (Math.exp(-1 * rank) + 1) - rank) + 1);
        if (this.players.filter(p => p.finished).length === this.players.length && this.currentRound === this.totalRounds)
            setTimeout(() => {
                this.endTexts.map(t => t.destroy());
                this.endTexts = [];
                this.score.draw();
                this.game.add.existing(new TextButton(this.game, this.centerX, this.centerY, {
                        text: 'Menu',
                        fontSize: 20,
                        font: Assets.CustomWebFonts.FontsKenvectorFuture.getName()
                    }, {
                        callback: () => {
                            this.game.state.start('title');
                            Network.clearListener('update');
                            Network.send('quit');
                        }
                    })
                );
            }, 3000);
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

    get centerX() {
        return this.camera.x + this.camera.width / 2;
    }

    get centerY() {
        return this.camera.y + this.camera.height / 2;
    }

    private finished() {
        this.finishTrigger.destroy();
        this.finishTrigger = null;
        this.player.stop();
        this.player.update();
        this.player.finished = true;
        this.currentRound++;

        let txt = this.game.add.text(this.centerX, this.centerY , 'Finished !', {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 35
        });
        txt.anchor.set(0.5);
        let rank = this.players.filter(p => p !== this.player && p.finished).length + 1;
        let rankTt = this.game.add.text(this.centerX  , this.centerY + txt.height , 'Rank : ' + this.toRank(rank), {
            font : Assets.CustomWebFonts.FontsKenvectorFuture.getName(),
            fontSize : 30
        });
        rankTt.anchor.set(0.5, 0.5);
        this.endTexts.push(txt, rankTt);
        if (this.currentRound === this.totalRounds) {
            this.sendPlayer();
            this.game.time.events.remove(this.networkTimer); // stop sending updates
        } else if (rank === this.players.length) {
            this.game.time.events.add(1000, () => {
                this.sendUpdate({'restart': true});
            });
        }
        this.endScore(this.myId);
    }

    public update(): void {
        this.game.physics.arcade.collide(this.collisionLayer, this.collidables);
        this.game.physics.arcade.collide(this.players, this.collisionLayer);

        if (this.player.finished) return;
        super.update(this.game);

        this.player.onEffect = false;
        this.game.physics.arcade.overlap(this.player, this.collidables, (p: Player, item) => {
            if (item instanceof Box && !p.hasItem()) {
                item.collect(p);
                this.sendUpdate({'boxTaken' : item.id});
            } else if (item instanceof EffectArea && p.arcadeBody.onFloor()) {
                item.Effect(p);
                this.player.onEffect = true;
            }
        });
        if (this.game.physics.arcade.overlap(this.player, this.finishTrigger)) this.finished();

        let divisor = 4;
        for (let bg of this.backgrounds) {
            bg.x = this.game.camera.x / divisor;
            divisor << 1;
        }

        if (this.pauseCapture || this.isCountingDown) return;


        let trulyjustdown = this.cursors.up.justDown;

        if (trulyjustdown && this.player.sm.is(PlayerStates.WallSliding) && this.player.arcadeBody.onWall()) {
            this.player.setJumping(true);
        }
        else if (trulyjustdown && this.player.arcadeBody.onFloor() && this.player.sm.isOneOf(PlayerStates.Running, PlayerStates.Idle) && this.jumptimer === 0) {
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
        if (this.cursors.left.isDown) {
            this.player.goDirection(PlayerDirection.Left);
        } else if (this.cursors.right.isDown) {
            this.player.goDirection(PlayerDirection.Right);
        }

        if (this.cursors.left.isUp && this.cursors.right.isUp && this.player.arcadeBody.onFloor() && !this.player.onEffect) {
            this.player.stop();
        }
        else if (this.cursors.left.isUp && this.cursors.right.isUp && this.player.sm.is(PlayerStates.Jumping)) {
            this.player.direction = PlayerDirection.None;
        }
        if (this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR).justDown) {
            this.player.useItem();
        }
    }
}
