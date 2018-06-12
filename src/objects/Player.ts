import * as Assets from '../assets';
import { FiniteStateMachine } from '../StateMachine';
import { PLAYER_ACCELERATION, PLAYER_JUMP, PLAYER_DESCELERATION, PLAYER_SPEED, PLAYER_WALLJUMP } from '../constant';
import {PlayerAnimation, PlayerStates, Config} from '../PlayerAnimation';

export enum PlayerDirection {
    Left = 'left',
    Right = 'right',
    None = 'none'
}

export class Player extends Phaser.Sprite {

    arcadeBody: Phaser.Physics.Arcade.Body;
    private dustParticles: Phaser.Particles.Arcade.Emitter;
    private isHalfWidth: boolean = false;
    public sm: FiniteStateMachine;
    public direction: PlayerDirection = PlayerDirection.Right;
    private wallJumped: boolean = false;

    constructor (public readonly id: number,
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
        this.arcadeBody.offset.x += this.arcadeBody.width / 2;
        this.anchor.set(0.5, 0.5);

        this.animations.add(PlayerAnimation.Run, [8, 9, 10, 11, 12, 13], 10, true);
        this.animations.add(PlayerAnimation.Idle, [0, 1, 2, 3], 5, true);
        this.animations.add(PlayerAnimation.Crouch, [4, 5, 6, 7], 5, true);
        this.animations.add(PlayerAnimation.JumpCrouch, [28], 5, false).onComplete.add(() => {
            this.animations.play(PlayerAnimation.SlideCrouch);
        });
        this.animations.add(PlayerAnimation.SlideCrouch, [24, 25, 26], 10, true);
        this.animations.add(PlayerAnimation.Jump, [16], 5, true);
        this.animations.add(PlayerAnimation.Land, [22, 23], 5, true);
        this.animations.add(PlayerAnimation.WallSliding, [93], 5, true);

        this.sm = new FiniteStateMachine(this.animations);
        this.initStatemachine();
    }

    public serialize(): Float32Array {
        // return new Float32Array([this.x, this.y, this.arcadeBody.velocity.x, this.arcadeBody.velocity.y, this.fsm.currentState]);
        return new Float32Array([]);
    }

    public deserialize(data: Float32Array): void {
        this.x = data[0];
        this.y = data[1];
        this.arcadeBody.velocity.x = data[2];
        this.arcadeBody.velocity.y = data[3];
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
        this.arcadeBody.offset.y = this.height / 2;
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
        if (this.direction !== dir) {
            this.arcadeBody.velocity.x = 0;
            this.direction = dir;
        }

        this.scale.x = Math.abs(this.scale.x) * mult;
    }

    public setJumping(jumping: boolean): void {
        if (jumping && !this.wallJumped) {
            if (this.arcadeBody.onFloor() && this.sm.isOneOf(PlayerStates.Idle, PlayerStates.Running)) {
                this.arcadeBody.velocity.y = -PLAYER_JUMP;
            } else if (this.sm.is(PlayerStates.WallSliding) && this.arcadeBody.onWall()) {
                let mult = this.arcadeBody.blocked.left ? 1 : -1;
                this.arcadeBody.velocity.set(PLAYER_SPEED.RUNNING * mult, -PLAYER_WALLJUMP);
                this.wallJumped = true;
                this.game.time.events.add(50, () => this.wallJumped = false);
            }
        }
    }

    public setCrouching(crouching: boolean): void {
        this.sm.setProperty('isCrouchPressed', crouching);
        if (crouching && this.sm.isOneOf(PlayerStates.Crouched, PlayerStates.CrouchWalking, PlayerStates.SlideCrouched)) {
            this.goHalfWidth();
        } else {
            this.exitHalfWidth();
        }
    }

    public stop(): void {
        if (this.wallJumped)return;
        this.arcadeBody.velocity.x = 0;
        this.arcadeBody.acceleration.x = 0;
        this.direction = PlayerDirection.None;
    }

    public update(): void {
        let onFloor = this.arcadeBody.onFloor();
        this.dustParticles.x = this.x;
        this.dustParticles.y = this.y + this.height / 2;
        this.dustParticles.on = onFloor && this.arcadeBody.velocity.x !== 0;

        if (!this.wallJumped)
            this.updateVelocity();

        let ltPos = this.collisionLayer.getTileXY(this.centerX, this.top, new Phaser.Point());
        let topLeft = this.map.getTile(ltPos.x, ltPos.y, this.collisionLayer);

        this.sm.setProperties({
            'isOnFloor' : onFloor,
            'velocityX': this.arcadeBody.velocity.x,
            'velocityY': this.arcadeBody.velocity.y,
            'isStuck': topLeft !== null,
            'isOnWall': this.arcadeBody.onWall()
        });
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
                this.arcadeBody.velocity.x *= PLAYER_ACCELERATION;
                break;
            case PlayerStates.Crouched:
                this.arcadeBody.velocity.x = PLAYER_SPEED.CROUCH * mult;
                break;
            case PlayerStates.SlideCrouched:
                this.arcadeBody.velocity.x /= PLAYER_DESCELERATION;
                break;
            case PlayerStates.Jumping:
                if (Math.abs(this.arcadeBody.velocity.x) < PLAYER_SPEED.JUMP)
                    this.arcadeBody.velocity.x = PLAYER_SPEED.JUMP * mult;
                else
                    this.arcadeBody.velocity.x /= PLAYER_DESCELERATION;
                break;
            case PlayerStates.WallSliding:
                if (this.arcadeBody.velocity.y > 50)
                    this.arcadeBody.velocity.y = 50;
                this.arcadeBody.velocity.x =  mult;
                break;
        }
    }
}