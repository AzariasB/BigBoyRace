import * as Assets from '../assets';
import { TypeState } from 'typestate';
import { PLAYER_ACCELERATION, PLAYER_JUMP, PLAYER_SPEED, PLAYER_DESCELERATION } from '../constant';

enum PlayerStates {
    Running,
    Iddle,
    Crouched,
    JumpCrouched,
    SlideCrouched,
    StuckCrouched,
    EndCrouched,
    Jumping,
    Landing
}


enum PlayerAnimation {
    Run = 'run_right',
    Iddle = 'iddle',
    Crouch = 'crouch',
    JumpCrouch = 'jum_crouch',
    SlideCrouch = 'slide_crouch',
    Jump = 'jump',
    Land = 'land'
}

export enum PlayerDirection {
    Left = 'left',
    Right = 'right'
}

export class Player extends Phaser.Sprite {

    arcadeBody: Phaser.Physics.Arcade.Body;
    private dustParticles: Phaser.Particles.Arcade.Emitter;
    public fsm: TypeState.FiniteStateMachine<PlayerStates> = new TypeState.FiniteStateMachine<PlayerStates>(PlayerStates.Landing);
    private isHalfWidth: boolean = false;

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
        this.animations.add(PlayerAnimation.Iddle, [0, 1, 2, 3]);
        this.animations.add(PlayerAnimation.Crouch, [4, 5, 6, 7]);
        this.animations.add(PlayerAnimation.JumpCrouch, [28]).onComplete.add(() => {
            this.fsm.go(PlayerStates.SlideCrouched);
        });
        this.animations.add(PlayerAnimation.SlideCrouch, [24, 25, 26]);
        this.animations.add(PlayerAnimation.Jump, [16]);
        this.animations.add(PlayerAnimation.Land, [22, 23]);

        this.initStatemachine();
    }

    public serialize(): Float32Array {
        return new Float32Array([this.x, this.y, this.arcadeBody.velocity.x, this.arcadeBody.velocity.y, this.fsm.currentState]);
    }

    public deserialize(data: Float32Array): void {
        this.x = data[0];
        this.y = data[1];
        this.arcadeBody.velocity.x = data[2];
        this.arcadeBody.velocity.y = data[3];
        this.fsm.currentState = data[4];
    }

    private initStatemachine(): void {
        this.fsm.from(PlayerStates.Iddle).to(PlayerStates.Crouched, PlayerStates.Jumping, PlayerStates.Running);
        this.fsm.from(PlayerStates.Running).to(PlayerStates.Iddle, PlayerStates.JumpCrouched, PlayerStates.Jumping, PlayerStates.Landing);
        this.fsm.from(PlayerStates.Jumping).to(PlayerStates.Landing);
        this.fsm.from(PlayerStates.Landing).to(PlayerStates.Running, PlayerStates.Iddle);
        this.fsm.from(PlayerStates.Crouched).to(PlayerStates.EndCrouched, PlayerStates.StuckCrouched);
        this.fsm.from(PlayerStates.JumpCrouched).to(PlayerStates.SlideCrouched, PlayerStates.EndCrouched);
        this.fsm.from(PlayerStates.SlideCrouched).to(PlayerStates.EndCrouched, PlayerStates.StuckCrouched);
        this.fsm.from(PlayerStates.EndCrouched).to(PlayerStates.Crouched, PlayerStates.Iddle, PlayerStates.Running, PlayerStates.StuckCrouched);

        this.stateToAnim(PlayerStates.Iddle, PlayerAnimation.Iddle, 5)
            .stateToAnim(PlayerStates.Crouched, PlayerAnimation.Crouch, 5)
            .stateToAnim(PlayerStates.Running, PlayerAnimation.Run)
            .stateToAnim(PlayerStates.Jumping, PlayerAnimation.Jump)
            .stateToAnim(PlayerStates.Landing, PlayerAnimation.Land)
            .stateToAnim(PlayerStates.JumpCrouched, PlayerAnimation.JumpCrouch, 10, false)
            .stateToAnim(PlayerStates.SlideCrouched, PlayerAnimation.SlideCrouch)
            .stateToAnim(PlayerStates.StuckCrouched, PlayerAnimation.Crouch, 5);

        this.fsm.on(PlayerStates.SlideCrouched, () => this.goHalfWidth());
        this.fsm.on(PlayerStates.Crouched, () => this.goHalfWidth());

        this.fsm.onExit(PlayerStates.EndCrouched, () => {
            let ltPos = this.collisionLayer.getTileXY(this.left, this.top, new Phaser.Point());
            let rtPos = this.collisionLayer.getTileXY(this.right, this.top, new Phaser.Point());
            let topLeft = this.map.getTile(ltPos.x, ltPos.y, this.collisionLayer);
            let topRight = this.map.getTile(rtPos.x, rtPos.y, this.collisionLayer);
            if (topLeft === null && topRight === null) {
                this.exitHalfWidth();
                return true;
            } else {
                return false;
            }
            return true;
        });
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

    private stateToAnim(state: PlayerStates, animation: PlayerAnimation, frameTime: number = 10, loop: boolean = true): Player {
        this.fsm.on(state, () => this.animations.play(animation, frameTime, loop));
        return this;
    }

    public goDirection(dir: PlayerDirection): void {
        let mult = dir === PlayerDirection.Left ? -1 : 1;
        if (! (this.fsm.is(PlayerStates.Crouched) || this.fsm.is(PlayerStates.SlideCrouched ) || this.arcadeBody.velocity.x !== 0) ) {
            this.arcadeBody.velocity.x = PLAYER_SPEED * mult;
        }
        this.scale.x = Math.abs(this.scale.x) * mult;
        if (this.arcadeBody.onFloor() && this.fsm.canGo(PlayerStates.Running)) {
            this.fsm.go(PlayerStates.Running);
        }
    }

    public jump(): void {
        if (this.arcadeBody.onFloor()) {
            this.arcadeBody.velocity.y = -PLAYER_JUMP;
            if (this.fsm.canGo(PlayerStates.Jumping)) this.fsm.go(PlayerStates.Jumping);
        }
    }

    public crouch(): void {
        if (this.arcadeBody.velocity.x !== 0) {
            if (this.fsm.canGo(PlayerStates.JumpCrouched)) this.fsm.go(PlayerStates.JumpCrouched);
        } else {
            if (this.fsm.canGo(PlayerStates.Crouched)) this.fsm.go(PlayerStates.Crouched);
        }
    }

    public stopCrouch(): void {
        if (this.fsm.canGo(PlayerStates.EndCrouched)) this.fsm.go(PlayerStates.EndCrouched);
    }

    public stop(): void {
        this.arcadeBody.velocity.x = 0;
        this.arcadeBody.acceleration.x = 0;
        if (this.arcadeBody.onFloor() && this.fsm.canGo(PlayerStates.Iddle)) {
            this.fsm.go(PlayerStates.Iddle);
        }
    }

    public update(): void {
        let onFloor = this.arcadeBody.onFloor();
        this.dustParticles.x = this.x;
        this.dustParticles.y = this.y + this.height / 2;
        this.dustParticles.on = onFloor && this.arcadeBody.velocity.x !== 0;

        if (this.fsm.is(PlayerStates.SlideCrouched))
            this.arcadeBody.velocity.x /= PLAYER_ACCELERATION;

        if (this.fsm.is(PlayerStates.Running)) {
            this.arcadeBody.velocity.x *= PLAYER_DESCELERATION;
        }

        if ((this.arcadeBody.velocity.y > 0) && this.fsm.canGo(PlayerStates.Landing)) {
            this.fsm.go(PlayerStates.Landing);
        }
        if (!onFloor)  return;
        if (this.arcadeBody.velocity.y >= 0 && this.fsm.is(PlayerStates.Jumping)) {
            this.fsm.go(PlayerStates.Landing);
        }

        // Update animations
        let xvel = this.arcadeBody.velocity.x;
        if (xvel === 0) {
            if (this.fsm.canGo(PlayerStates.Iddle)) this.fsm.go(PlayerStates.Iddle);
            return;
        }

        if (this.fsm.canGo(PlayerStates.Running))this.fsm.go(PlayerStates.Running);
    }
}