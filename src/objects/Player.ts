import * as Assets from '../assets';
import { FiniteStateMachine } from '../StateMachine';
import { PLAYER_ACCELERATION, PLAYER_JUMP, PLAYER_DESCELERATION, PLAYER_SPEED } from '../constant';
import {PlayerAnimation, PlayerStates, Config} from '../PlayerAnimation';

export enum PlayerDirection {
    Left = 'left',
    Right = 'right'
}

export class Player extends Phaser.Sprite {

    arcadeBody: Phaser.Physics.Arcade.Body;
    private dustParticles: Phaser.Particles.Arcade.Emitter;
    private isHalfWidth: boolean = false;
    private sm: FiniteStateMachine;

    constructor (game: Phaser.Game, x: number, y: number,
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

        this.animations.add(PlayerAnimation.Run, [8, 9, 10, 11, 12, 13]);
        this.animations.add(PlayerAnimation.Idle, [0, 1, 2, 3]);
        this.animations.add(PlayerAnimation.Crouch, [4, 5, 6, 7]);
        this.animations.add(PlayerAnimation.JumpCrouch, [28]).onComplete.add(() => {
            this.animations.play(PlayerAnimation.SlideCrouch);
        });
        this.animations.add(PlayerAnimation.SlideCrouch, [24, 25, 26]);
        this.animations.add(PlayerAnimation.Jump, [16]);
        this.animations.add(PlayerAnimation.Land, [22, 23]);
        this.animations.add(PlayerAnimation.WallSliding, [93]);

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

        // this.fsm.on(PlayerStates.SlideCrouched, () => this.goHalfWidth());
        // this.fsm.on(PlayerStates.Crouched, () => this.goHalfWidth());

        // this.fsm.onExit(PlayerStates.EndCrouched, () => {
        //     let ltPos = this.collisionLayer.getTileXY(this.left, this.top, new Phaser.Point());
        //     let rtPos = this.collisionLayer.getTileXY(this.right, this.top, new Phaser.Point());
        //     let topLeft = this.map.getTile(ltPos.x, ltPos.y, this.collisionLayer);
        //     let topRight = this.map.getTile(rtPos.x, rtPos.y, this.collisionLayer);
        //     if (topLeft === null && topRight === null) {
        //         this.exitHalfWidth();
        //         return true;
        //     } else {
        //         return false;
        //     }
        //     return true;
        // });
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
        if (! (this.sm.isOneOf(PlayerStates.Crouched, PlayerStates.SlideCrouched) || this.arcadeBody.velocity.x !== 0) ) {
            this.arcadeBody.velocity.x = PLAYER_SPEED * mult;
        }
        this.scale.x = Math.abs(this.scale.x) * mult;
    }

    public setJumping(jumping: boolean): void {
        this.sm.setProperty('isJumpPressed', jumping);
        if (jumping && this.arcadeBody.onFloor()) {
            this.arcadeBody.velocity.y = -PLAYER_JUMP;
        }
    }

    public setCrouching(crouching: boolean): void {
        this.sm.setProperty('isCrouchPressed', crouching);
    }

    public stop(): void {
        this.arcadeBody.velocity.x = 0;
        this.arcadeBody.acceleration.x = 0;
    }

    public update(): void {
        let onFloor = this.arcadeBody.onFloor();
        this.dustParticles.x = this.x;
        this.dustParticles.y = this.y + this.height / 2;
        this.dustParticles.on = onFloor && this.arcadeBody.velocity.x !== 0;

        if (this.sm.is(PlayerStates.SlideCrouched))
            this.arcadeBody.velocity.x /= PLAYER_ACCELERATION;

        if (this.sm.is(PlayerStates.Running)) {
            this.arcadeBody.velocity.x *= PLAYER_DESCELERATION;
        }

        this.sm.setProperties({
            'isOnFloor' : this.arcadeBody.onFloor(),
            'velocityX': this.arcadeBody.velocity.x,
            'velocityY': this.arcadeBody.velocity.y,
            'isStuck': false,
            'isOnWall': this.arcadeBody.onWall()
        });
    }
}