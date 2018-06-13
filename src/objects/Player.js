"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Assets = require("../assets");
const StateMachine_1 = require("../StateMachine");
const constant_1 = require("../constant");
const PlayerAnimation_1 = require("../PlayerAnimation");
const EmptyPowerup_1 = require("./powerups/EmptyPowerup");
var PlayerDirection;
(function (PlayerDirection) {
    PlayerDirection["Left"] = "left";
    PlayerDirection["Right"] = "right";
    PlayerDirection["None"] = "none";
})(PlayerDirection = exports.PlayerDirection || (exports.PlayerDirection = {}));
class Player extends Phaser.Sprite {
    constructor(id, game, x, y, group, map, collisionLayer) {
        super(game, x, y, group);
        this.id = id;
        this.map = map;
        this.collisionLayer = collisionLayer;
        this.isHalfWidth = false;
        this.direction = PlayerDirection.Right;
        this.wallJumped = false;
        this.item = new EmptyPowerup_1.EmptyPowerup(this.game, 50, 50);
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
        this.arcadeBody.maxVelocity.x = 1000;
        this.arcadeBody.maxVelocity.y = 1000;
        this.animations.add(PlayerAnimation_1.PlayerAnimation.Run, [8, 9, 10, 11, 12, 13], 10, true);
        this.animations.add(PlayerAnimation_1.PlayerAnimation.Idle, [0, 1, 2, 3], 5, true);
        this.animations.add(PlayerAnimation_1.PlayerAnimation.Crouch, [4, 5, 6, 7], 5, true);
        this.animations.add(PlayerAnimation_1.PlayerAnimation.JumpCrouch, [28], 5, false).onComplete.add(() => {
            this.animations.play(PlayerAnimation_1.PlayerAnimation.SlideCrouch);
        });
        this.animations.add(PlayerAnimation_1.PlayerAnimation.SlideCrouch, [24, 25, 26], 10, true);
        this.animations.add(PlayerAnimation_1.PlayerAnimation.Jump, [16], 5, true);
        this.animations.add(PlayerAnimation_1.PlayerAnimation.Land, [22, 23], 5, true);
        this.animations.add(PlayerAnimation_1.PlayerAnimation.WallSliding, [93], 5, true);
        this.sm = new StateMachine_1.FiniteStateMachine(this.animations);
        this.initStatemachine();
    }
    serialize() {
        // return new Float32Array([this.x, this.y, this.arcadeBody.velocity.x, this.arcadeBody.velocity.y, this.fsm.currentState]);
        return new Float32Array([]);
    }
    deserialize(data) {
        this.x = data[0];
        this.y = data[1];
        this.arcadeBody.velocity.x = data[2];
        this.arcadeBody.velocity.y = data[3];
    }
    initStatemachine() {
        const states = PlayerAnimation_1.Config.states;
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
        this.sm.setCurrentState(PlayerAnimation_1.PlayerStates.Idle);
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
        if (this.direction !== dir && !this.sm.is(PlayerAnimation_1.PlayerStates.Jumping)) {
            this.arcadeBody.velocity.x = 0;
        }
        this.direction = dir;
        this.scale.x = Math.abs(this.scale.x) * mult;
    }
    setJumping(jumping) {
        if (jumping && !this.wallJumped) {
            if (this.arcadeBody.onFloor() && this.sm.isOneOf(PlayerAnimation_1.PlayerStates.Idle, PlayerAnimation_1.PlayerStates.Running)) {
                this.arcadeBody.velocity.y = -constant_1.PLAYER_JUMP;
            }
            else if (this.sm.is(PlayerAnimation_1.PlayerStates.WallSliding) && this.arcadeBody.onWall()) {
                let mult = this.arcadeBody.blocked.left ? 1 : -1;
                this.direction = PlayerDirection.None;
                this.arcadeBody.velocity.set(constant_1.PLAYER_SPEED.RUNNING * mult * 2.5, -constant_1.PLAYER_WALLJUMP);
                this.wallJumped = true;
                this.game.time.events.add(20, () => this.wallJumped = false);
            }
        }
    }
    setCrouching(crouching) {
        this.sm.setProperty('isCrouchPressed', crouching);
        if (crouching && this.sm.isOneOf(PlayerAnimation_1.PlayerStates.Crouched, PlayerAnimation_1.PlayerStates.CrouchWalking, PlayerAnimation_1.PlayerStates.SlideCrouched)) {
            this.goHalfWidth();
        }
        else {
            this.exitHalfWidth();
        }
    }
    setItem(powerup) {
        this.item = powerup;
    }
    getItem() {
        return this.item;
    }
    useItem() {
        this.item.activate();
        this.item = new EmptyPowerup_1.EmptyPowerup(this.game, 50, 50);
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
        this.dustParticles.x = this.x;
        this.dustParticles.y = this.y + this.height / 2;
        this.dustParticles.on = onFloor && this.arcadeBody.velocity.x !== 0;
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
        // console.log(this.item);
    }
    updateVelocity() {
        let mult = this.direction === PlayerDirection.Left ? -1 :
            this.direction === PlayerDirection.Right ? 1 : 0;
        switch (this.sm.currentStateName) {
            case PlayerAnimation_1.PlayerStates.Idle:
                this.arcadeBody.velocity.x = constant_1.PLAYER_SPEED.RUNNING * mult;
                break;
            case PlayerAnimation_1.PlayerStates.Running:
                if (Math.abs(this.arcadeBody.velocity.x) < constant_1.PLAYER_SPEED.RUNNING)
                    this.arcadeBody.velocity.x = constant_1.PLAYER_SPEED.RUNNING * mult;
                else
                    this.arcadeBody.velocity.x *= constant_1.PLAYER_ACCELERATION;
                break;
            case PlayerAnimation_1.PlayerStates.Crouched:
                this.arcadeBody.velocity.x = constant_1.PLAYER_SPEED.CROUCH * mult;
                break;
            case PlayerAnimation_1.PlayerStates.SlideCrouched:
                this.arcadeBody.velocity.x /= constant_1.PLAYER_DESCELERATION;
                break;
            case PlayerAnimation_1.PlayerStates.Jumping:
                if (Math.abs(this.arcadeBody.velocity.x) < constant_1.PLAYER_SPEED.JUMP) {
                    console.log('passage vitesse de base');
                    this.arcadeBody.velocity.x = constant_1.PLAYER_SPEED.JUMP * mult;
                }
                else if (Math.sign(this.arcadeBody.velocity.x) !== mult) {
                    this.arcadeBody.velocity.x += 10 * mult;
                }
                else {
                    this.arcadeBody.velocity.x /= constant_1.PLAYER_DESCELERATION;
                }
                break;
            case PlayerAnimation_1.PlayerStates.WallSliding:
                if (this.arcadeBody.velocity.y > 50)
                    this.arcadeBody.velocity.y = 50;
                this.arcadeBody.velocity.x = mult;
                break;
        }
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map