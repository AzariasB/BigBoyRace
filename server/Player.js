
const FiniteStateMachine = require('./StateMachine')

module.exports = class Player extends Phaser.Sprite {

    constructor(game, x, y, group, id, socket) {
        super(game, x, y, group);
        this.id = id;
        this.socket = socket;
        this.sm = new FiniteStateMachine();
        this.map = map;
        this.collisionLayer = collisionLayer;
        this.isHalfWidth = false;
        this.direction = PlayerDirection.Right;
        this.wallJumped = false;
        this.height = this.map.tileHeight * 2;
        this.width = this.map.tileWidth * 2;
        this.game.physics.arcade.enable(this);
        this.arcadeBody = this.body;
        this.arcadeBody.collideWorldBounds = true;
        this.arcadeBody.width /= 2;
        this.arcadeBody.offset.x += this.arcadeBody.width / 2;
        this.anchor.set(0.5, 0.5);
        this.initStatemachine();
    }

    deserialize(data) {
        this.x = data[0];
        this.y = data[1];
        this.arcadeBody.velocity.x = data[2];
        this.arcadeBody.velocity.y = data[3];
    }

    initStatemachine() {
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

    goHalfWidth() {
        if (this.isHalfWidth)
            return;
        this.arcadeBody.height /= 2;
        this.arcadeBody.offset.y = this.height / 2;
        this.isHalfWidth = true;
    }

    exitHalfWidth() {
        if (!this.isHalfWidth)
            return;
        this.arcadeBody.height *= 2;
        this.arcadeBody.offset.y = 0;
        this.isHalfWidth = false;
    }

    goDirection(dir) {
        let mult = dir === PlayerDirection.Left ? -1 : 1;
        if (this.direction !== dir) {
            this.arcadeBody.velocity.x = 0;
            this.direction = dir;
        }
        this.scale.x = Math.abs(this.scale.x) * mult;
    }

    setJumping(jumping) {
        if (jumping && !this.wallJumped) {
            if (this.arcadeBody.onFloor() && this.sm.isOneOf(PlayerStates.Idle, PlayerStates.Running)) {
                this.arcadeBody.velocity.y = -PLAYER_JUMP;
            }
            else if (this.sm.is(PlayerStates.WallSliding) && this.arcadeBody.onWall()) {
                let mult = this.arcadeBody.blocked.left ? 1 : -1;
                this.arcadeBody.velocity.set(PLAYER_SPEED.RUNNING * mult, -PLAYER_WALLJUMP);
                this.wallJumped = true;
                this.game.time.events.add(50, () => this.wallJumped = false);
            }
        }
    }

    setCrouching(crouching) {
        this.sm.setProperty('isCrouchPressed', crouching);
        if (crouching && this.sm.isOneOf(PlayerStates.Crouched, PlayerStates.CrouchWalking, PlayerStates.SlideCrouched)) {
            this.goHalfWidth();
        }
        else {
            this.exitHalfWidth();
        }
    }
    
    stop() {
        if (this.wallJumped)
            return;
        this.arcadeBody.velocity.x = 0;
        this.arcadeBody.acceleration.x = 0;
        this.direction = PlayerDirection.None;
    }

    update() {
        let onFloor = this.arcadeBody.onFloor();
        if (!this.wallJumped)
            this.updateVelocity();
        let ltPos = this.collisionLayer.getTileXY(this.centerX, this.top, new Phaser.Point());
        let topLeft = this.map.getTile(ltPos.x, ltPos.y, this.collisionLayer);
        this.sm.setProperties({
            'isOnFloor': onFloor,
            'velocityX': this.arcadeBody.velocity.x,
            'velocityY': this.arcadeBody.velocity.y,
            'isStuck': topLeft !== null,
            'isOnWall': this.arcadeBody.onWall()
        });
    }

    updateVelocity() {
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
                this.arcadeBody.velocity.x = mult;
                break;
        }
    }    

}