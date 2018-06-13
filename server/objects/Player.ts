import * as socket from 'socket.io';
import { FiniteStateMachine } from '../../src/StateMachine';
import { PlayerDirection, Config, PlayerStates } from '../../src/PlayerAnimation';
import { PLAYER_JUMP, PLAYER_SPEED, PLAYER_WALLJUMP, WALLJUMP_IGNORE_TIME, PLAYER_ACCELERATION, PLAYER_DESCELERATION, N_INPUT } from '../../src/constant';

export default class Player extends Phaser.Sprite {

    public arcadeBody: Phaser.Physics.Arcade.Body;
    private isHalfWidth: boolean = false;
    public sm: FiniteStateMachine;
    public direction: PlayerDirection = PlayerDirection.Right;
    private wallJumped: boolean = false;


    constructor(
        public id: number,
        public socket: SocketIO.Socket,
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

        this.arcadeBody = this.body;
        this.arcadeBody.collideWorldBounds = true;
        this.arcadeBody.width /= 2;
        this.arcadeBody.offset.x += this.arcadeBody.width / 2;
        this.anchor.set(0.5, 0.5);

        this.sm = new FiniteStateMachine();
        this.initStateMachine();
    }

    public serialize() {
        return [this.id, this.x, this.y, this.arcadeBody.velocity.x, this.arcadeBody.velocity.y];
    }

    private initStateMachine() {
        const states = Config.states;
        for (let k in states) {
            this.sm.addState(k);
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
                this.game.time.events.add(WALLJUMP_IGNORE_TIME, () => this.wallJumped = false);
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
        if (!this.wallJumped) this.updateVelocity();

        let ltPos = this.collisionLayer.getTileXY(this.centerX, this.top, new Phaser.Point());
        let topLeft = this.map.getTile(ltPos.x, ltPos.y, this.collisionLayer);

        this.sm.setProperties({
            'isOnFloor' : this.arcadeBody.onFloor(),
            'velocityX': this.arcadeBody.velocity.x,
            'velocityY': this.arcadeBody.velocity.y,
            'isStuck': topLeft !== null,
            'isOnWall': this.arcadeBody.onWall()
        });
    }

    public handleInput(inputs: Int8Array) {
        this.setCrouching(!!inputs[N_INPUT.DOWN ]);
        this.setJumping(!!inputs[N_INPUT.UP]);
        if ( !!inputs[N_INPUT.LEFT] ) {
            this.goDirection(PlayerDirection.Left);
        } else if ( !!this.input[N_INPUT.RIGHT]) {
            this.goDirection(PlayerDirection.Right);
        } else {
            this.stop();
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