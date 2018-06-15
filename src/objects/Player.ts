import * as Assets from '../assets';
import { FiniteStateMachine } from '../StateMachine';
import {PlayerAnimation, PlayerStates, Config, PlayerDirection} from '../PlayerAnimation';
import { PLAYER_ACCELERATION, PLAYER_FIRSTJUMP, PLAYER_DESCELERATION, PLAYER_SPEED, PLAYER_WALLJUMP } from '../constant';
import { Powerup } from './powerups/Powerup';
import {EmptyPowerup} from './powerups/EmptyPowerup';

export class Player extends Phaser.Sprite {

    arcadeBody: Phaser.Physics.Arcade.Body;
    private dustParticles: Phaser.Particles.Arcade.Emitter;
    private isHalfWidth: boolean = false;
    public sm: FiniteStateMachine;
    public finished: boolean = false;
    public direction: PlayerDirection = PlayerDirection.None;
    public onEffect: boolean;
    private item: Powerup = new EmptyPowerup(this.game, 50, 50);

    constructor (public readonly isRemote: boolean,
                    game: Phaser.Game,
                    x: number,
                    y: number,
                    group: string,
                    private  map: Phaser.Tilemap,
                    private collisionLayer: Phaser.TilemapLayer) {
        super(game, x, y, group);

        this.height = this.map.tileHeight * 2;
        this.width = this.map.tileWidth * 2;
        this.game.physics.arcade.enable(this);

        this.dustParticles = this.game.add.emitter(x, y, 10);
        this.dustParticles.makeParticles(Assets.Images.ImagesDust.getName());
        this.dustParticles.gravity.y = 400;
        this.dustParticles.minParticleScale = this.dustParticles.maxParticleScale = 0.5;
        this.dustParticles.start(false, 100, 10);
        this.dustParticles.on = false;

        this.arcadeBody = this.body;
        this.arcadeBody.collideWorldBounds = true;
        this.arcadeBody.width /= 2;
        this.arcadeBody.offset.x += (this.arcadeBody.width / this.scale.y) / 2;
        this.anchor.set(0.5, 0.5);
        this.arcadeBody.maxVelocity.x = 1000;
        this.arcadeBody.maxVelocity.y = 1000;



        this.animations.add(PlayerAnimation.Run, [0, 1, 3, 4, 5, 6, 7], 10, true);
        this.animations.add(PlayerAnimation.Idle, [21, 22, 23, 24, 25], 5, true);
        this.animations.add(PlayerAnimation.Crouch, [14, 15, 16, 16, 16, 15], 5, true);
        this.animations.add(PlayerAnimation.JumpCrouch, [18], 12, false).onComplete.add(() => {
            this.animations.play(PlayerAnimation.SlideCrouch);
        });
        this.animations.add(PlayerAnimation.SlideCrouch, [19], 10, true);
        this.animations.add(PlayerAnimation.Jump, [9, 10], 15, false).onComplete.add(() => {
            this.animations.play(PlayerAnimation.OnAir);
        });
        this.animations.add(PlayerAnimation.OnAir, [11], 5, false).onComplete.add(() => {
            if (this.arcadeBody.velocity.y < 50)
                this.animations.play(PlayerAnimation.OnAir);
            else
                this.animations.play(PlayerAnimation.Land);
        });
        this.animations.add(PlayerAnimation.Land, [12], 5, true);
        this.animations.add(PlayerAnimation.WallSliding, [13], 5, true);
        this.animations.add(PlayerAnimation.WalkCrouch, [28, 29, 30, 31, 32], 10, true);

        this.sm = new FiniteStateMachine(this.animations);
        this.initStatemachine();
    }

    public serialize() {
        return {
            x: this.x,
            y: this.y,
            vx: this.arcadeBody.velocity.x,
            vy: this.arcadeBody.velocity.y,
            state: this.sm.currentStateName,
            direction: this.direction,
            finished: this.finished
        };
    }

    public deserialize(data: any) {
        this.position.set(data.x, data.y);
        this.finished = data.finished;
        this.arcadeBody.velocity.set(data.vx, data.vy);
        if (data.direction !== PlayerDirection.None) {
            this.scale.x = Math.abs(this.scale.x) * (data.direction === PlayerDirection.Left ? -1 : 1);
        }

        this.sm.setCurrentState(data.state);
        if (this.finished) this.stop();
    }

    private initStatemachine(): void {
        const states = Config.states;
        for (let k in states) {
            this.sm.addState(k, states[k].animation);
        }
        for (let origin in states) {
            let transitions = states[origin].transitions;
            for (let destination in transitions) {
                this.sm.from(origin)
                        .to(destination)
                        .when(transitions[destination]);
            }
        }
        this.sm.setCurrentState(PlayerStates.Idle);
    }

    private goHalfWidth() {
        if (this.isHalfWidth)return;
        this.arcadeBody.height /= 2;
        this.arcadeBody.offset.y = (this.height / this.scale.y) / 2;
        this.isHalfWidth = true;
    }

    private exitHalfWidth() {
        if (!this.isHalfWidth)return;
        this.arcadeBody.height *= 2;
        this.arcadeBody.offset.y = 0;
        this.isHalfWidth = false;
    }

    public goDirection(dir: PlayerDirection): void {
        let mult = dir === PlayerDirection.Left ? -1 : 1;
        if (this.direction !== dir && this.arcadeBody.onFloor() && !this.onEffect) {
            this.arcadeBody.velocity.x = 0;
        }

        this.direction = dir;
        this.scale.x = Math.abs(this.scale.x) * mult;
    }

    public setJumping(jumping: boolean): void {
        let mult = this.arcadeBody.blocked.left ? 1 : -1;
        this.arcadeBody.velocity.set(PLAYER_SPEED.RUNNING * mult * 2, -PLAYER_WALLJUMP);
    }

    public setCrouching(crouching: boolean): void {
        if (this.finished) return;

        this.sm.setProperty('isCrouchPressed', crouching);
        if (crouching && this.sm.isOneOf(PlayerStates.Crouched, PlayerStates.CrouchWalking, PlayerStates.SlideCrouched)) {
            this.goHalfWidth();
        } else {
            this.exitHalfWidth();
        }
    }

    public setItem(powerup: Powerup) {
        this.item = powerup;
        this.game.add.existing(this.getItem());
    }

    public getItem() {
        return this.item;
    }

    public useItem() {
        this.item.activate(this);
        this.item.destroy(true);
        this.item = new EmptyPowerup(this.game, 50, 50);
    }

    public stop(): void {
        this.arcadeBody.velocity.x = 0;
        this.arcadeBody.acceleration.x = 0;
        this.direction = PlayerDirection.None;
    }

    public update(): void {
        super.update();

        let onFloor = this.arcadeBody.onFloor();
        this.dustParticles.x = this.x;
        this.dustParticles.y = this.y + this.height / 2;
        this.dustParticles.on = onFloor && this.arcadeBody.velocity.x !== 0;
        if (!this.onEffect) {
            this.updateVelocity();
        }

        if (!this.isRemote) {
            this.updateVelocity();

            let ltPos = this.collisionLayer.getTileXY(this.centerX, this.top, new Phaser.Point());
            let topCenter = this.map.getTile(ltPos.x, ltPos.y, this.collisionLayer);
            this.sm.setProperties({
                'isOnFloor' : onFloor,
                'velocityX': this.arcadeBody.velocity.x,
                'velocityY': this.arcadeBody.velocity.y,
                'isStuck': topCenter !== null,
                'isOnWall': this.arcadeBody.onWall()
            });
        }
    }

    private updateVelocity() {
        let mult = this.direction === PlayerDirection.Left ? -1 :
                   this.direction === PlayerDirection.Right ? 1 : 0;
        switch (this.sm.currentStateName) {
            case PlayerStates.Idle:
                this.arcadeBody.velocity.x = PLAYER_SPEED.RUNNING * mult;
                break;
            case PlayerStates.Running:
                if (Math.abs(this.arcadeBody.velocity.x) < PLAYER_SPEED.RUNNING)
                    this.arcadeBody.velocity.x = PLAYER_SPEED.RUNNING * mult;
                else
                    this.arcadeBody.velocity.x *= PLAYER_ACCELERATION;
                break;
            case PlayerStates.Crouched:
                this.arcadeBody.velocity.x = PLAYER_SPEED.CROUCH * mult;
                break;
            case PlayerStates.CrouchWalking:
                this.arcadeBody.velocity.x = PLAYER_SPEED.CROUCH * mult;
                break;
            case PlayerStates.SlideCrouched:
                this.arcadeBody.velocity.x /= PLAYER_DESCELERATION;
                break;
            case PlayerStates.Jumping:
                if (Math.abs(this.arcadeBody.velocity.x) < PLAYER_SPEED.JUMP) {
                    this.arcadeBody.velocity.x = PLAYER_SPEED.JUMP * mult;
                }
                else if (  Math.sign(this.arcadeBody.velocity.x) !== mult && mult !== 0 ) {
                    this.arcadeBody.velocity.x += (15 + Math.abs(this.arcadeBody.velocity.x) * 0.05) * mult;
                } else {
                    this.arcadeBody.velocity.x /= PLAYER_DESCELERATION;
                }
                break;
            case PlayerStates.WallSliding:
                if (this.arcadeBody.velocity.y > 50)
                    this.arcadeBody.velocity.y = 50;
                    if (Math.abs(this.arcadeBody.velocity.x) < 100) {
                        this.arcadeBody.velocity.x =  mult;
                   }
                break;
        }
    }
}