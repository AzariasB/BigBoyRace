import * as Assets from '../assets';
import {TypeState} from 'typestate';

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

export default class Player extends Phaser.Sprite {

    arcadeBody: Phaser.Physics.Arcade.Body;
    private dustParticles: Phaser.Particles.Arcade.Emitter;
    private fsm: TypeState.FiniteStateMachine<PlayerStates> = new TypeState.FiniteStateMachine<PlayerStates>(PlayerStates.Landing);
    private isHalfWidth: boolean = false;

    constructor (game: Phaser.Game, x: number, y: number, group: string, private collisionLayer: Phaser.TilemapLayer) {
        super(game, x, y, group);
        this.game.physics.arcade.enable(this);
        this.dustParticles = this.game.add.emitter(x, y, 10);
        this.dustParticles.makeParticles(Assets.Images.ImagesDust.getName());
        this.dustParticles.gravity.y = 400;
        this.dustParticles.minParticleScale = this.dustParticles.maxParticleScale = 0.5;
        this.dustParticles.start(false, 100, 10);
        this.dustParticles.on = false;

        this.arcadeBody = this.body;
        this.arcadeBody.gravity.y = 800;
        this.arcadeBody.collideWorldBounds = true;
        this.anchor.set(0.5, 0.5);

        this.animations.add(PlayerAnimation.Run, [24, 25, 26, 27, 28, 29, 30, 31]);
        this.animations.add(PlayerAnimation.Iddle, [0]);
        this.animations.add(PlayerAnimation.Crouch, [1]);
        this.animations.add(PlayerAnimation.JumpCrouch, [16]).onComplete.add(() => {
            this.fsm.go(PlayerStates.SlideCrouched);
        });
        this.animations.add(PlayerAnimation.SlideCrouch, [17]);
        this.animations.add(PlayerAnimation.Jump, [6]);
        this.animations.add(PlayerAnimation.Land, [7]);

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

        this.stateToAnim(PlayerStates.Iddle, PlayerAnimation.Iddle)
            .stateToAnim(PlayerStates.Crouched, PlayerAnimation.Crouch)
            .stateToAnim(PlayerStates.Running, PlayerAnimation.Run, 20, true)
            .stateToAnim(PlayerStates.Jumping, PlayerAnimation.Jump)
            .stateToAnim(PlayerStates.Landing, PlayerAnimation.Land)
            .stateToAnim(PlayerStates.JumpCrouched, PlayerAnimation.JumpCrouch, 10, false)
            .stateToAnim(PlayerStates.SlideCrouched, PlayerAnimation.SlideCrouch)
            .stateToAnim(PlayerStates.StuckCrouched, PlayerAnimation.Crouch);

        this.fsm.on(PlayerStates.SlideCrouched, () => this.goHalfWidth());
        this.fsm.on(PlayerStates.Crouched, () => this.goHalfWidth());

        this.fsm.onExit(PlayerStates.EndCrouched, () => {
            this.exitHalfWidth();
            /* if (this.game.physics.arcade.collide(this.arcadeBody, this.collisionLayer)) {// crouch
                console.log(this.arcadeBody.touching);
                // this.fsm.go(PlayerStates.StuckCrouched);
                this.goHalfWidth();
                return false;
            } */
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

    private stateToAnim(state: PlayerStates, animation: PlayerAnimation, frameTime?: number, loop?: boolean): Player {
        this.fsm.on(state, () => this.animations.play(animation, frameTime, loop));
        return this;
    }

    public goLeft(): void {
        if (!this.fsm.is(PlayerStates.Crouched)) this.arcadeBody.velocity.x = -250;
        if (this.scale.x > 0)this.scale.x *= -1;
        if (this.arcadeBody.onFloor() && this.fsm.canGo(PlayerStates.Running)) {
            this.fsm.go(PlayerStates.Running);
        }
    }

    public goRight(): void {
        if (!this.fsm.is(PlayerStates.Crouched)) this.arcadeBody.velocity.x = 250;
        if (this.scale.x < 0)this.scale.x *= -1;
        if (this.arcadeBody.onFloor() && this.fsm.canGo(PlayerStates.Running)) {
            this.fsm.go(PlayerStates.Running);
        }
    }

    public jump(): void {
        if (this.arcadeBody.onFloor()) {
            this.arcadeBody.velocity.y = -400;
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
        if (this.arcadeBody.onFloor() && this.fsm.canGo(PlayerStates.Iddle)) {
            this.fsm.go(PlayerStates.Iddle);
        }
    }

    public update(): void {
        let onFloor = this.arcadeBody.onFloor();
        this.dustParticles.x = this.x;
        this.dustParticles.y = this.y + this.height / 2;
        this.dustParticles.on = onFloor && this.arcadeBody.velocity.x !== 0;

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