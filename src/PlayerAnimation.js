"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constant_1 = require("./constant");
var PlayerDirection;
(function (PlayerDirection) {
    PlayerDirection["Left"] = "left";
    PlayerDirection["Right"] = "right";
    PlayerDirection["None"] = "none";
})(PlayerDirection = exports.PlayerDirection || (exports.PlayerDirection = {}));
var PlayerStates;
(function (PlayerStates) {
    PlayerStates["Running"] = "Running";
    PlayerStates["Idle"] = "Idle";
    PlayerStates["Crouched"] = "Crouched";
    PlayerStates["SlideCrouched"] = "SlideCrouched";
    PlayerStates["WallSliding"] = "WallSliding";
    PlayerStates["CrouchWalking"] = "CrouchWalking";
    PlayerStates["Jumping"] = "Jumping";
    PlayerStates["Landing"] = "Landing";
})(PlayerStates = exports.PlayerStates || (exports.PlayerStates = {}));
var PlayerAnimation;
(function (PlayerAnimation) {
    PlayerAnimation["Run"] = "run_right";
    PlayerAnimation["Idle"] = "idle";
    PlayerAnimation["Crouch"] = "crouch";
    PlayerAnimation["JumpCrouch"] = "jum_crouch";
    PlayerAnimation["SlideCrouch"] = "slide_crouch";
    PlayerAnimation["WalkCrouch"] = "walk_crouch";
    PlayerAnimation["WallSliding"] = "wall_sliding";
    PlayerAnimation["Jump"] = "jump";
    PlayerAnimation["Land"] = "land";
})(PlayerAnimation = exports.PlayerAnimation || (exports.PlayerAnimation = {}));
class AnimationConfiguration {
    constructor(init) {
        Object.assign(this, init);
    }
}
exports.AnimationConfiguration = AnimationConfiguration;
const Config = new AnimationConfiguration({
    states: {
        [PlayerStates.Idle]: {
            animation: PlayerAnimation.Idle,
            transitions: {
                [PlayerStates.Crouched]: opts => opts.isCrouchPressed,
                [PlayerStates.Jumping]: opts => opts.velocityY !== 0,
                [PlayerStates.Running]: opts => opts.velocityX !== 0
            }
        },
        [PlayerStates.Running]: {
            animation: PlayerAnimation.Run,
            transitions: {
                [PlayerStates.SlideCrouched]: opts => opts.isCrouchPressed,
                [PlayerStates.Jumping]: opts => opts.velocityY !== 0,
                [PlayerStates.Idle]: opts => opts.isOnFloor && opts.velocityX === 0
            }
        },
        [PlayerStates.SlideCrouched]: {
            animation: PlayerAnimation.JumpCrouch,
            transitions: {
                [PlayerStates.Crouched]: opts => opts.velocityX === 0,
                [PlayerStates.Running]: opts => opts.velocityX !== 0 && !opts.isStuck && !opts.isCrouchPressed
                // could add a state to go from sliding to iddle ?
            }
        },
        [PlayerStates.Crouched]: {
            animation: PlayerAnimation.Crouch,
            transitions: {
                [PlayerStates.CrouchWalking]: opts => opts.velocityX !== 0,
                [PlayerStates.Idle]: opts => !opts.isStuck && !opts.isCrouchPressed,
            }
        },
        [PlayerStates.CrouchWalking]: {
            animation: PlayerAnimation.WalkCrouch,
            transitions: {
                [PlayerStates.Idle]: opts => !opts.isCrouchPressed && !opts.isStuck,
                [PlayerStates.Jumping]: opts => !opts.isOnFloor,
                [PlayerStates.Crouched]: opts => opts.velocityX === 0
            }
        },
        [PlayerStates.Jumping]: {
            animation: PlayerAnimation.Jump,
            transitions: {
                [PlayerStates.Running]: opts => opts.isOnFloor && opts.velocityX !== 0,
                [PlayerStates.Idle]: opts => opts.isOnFloor && opts.velocityX === 0,
                [PlayerStates.WallSliding]: opts => !opts.isOnFloor && opts.isOnWall && opts.velocityY > -150 && opts.velocityY < constant_1.PLAYER_VMAX_GRAB_WALLSLIDE
            }
        },
        [PlayerStates.WallSliding]: {
            animation: PlayerAnimation.WallSliding,
            transitions: {
                [PlayerStates.Jumping]: opts => !opts.isOnWall && !opts.isOnFloor,
                [PlayerStates.Idle]: opts => opts.isOnFloor,
                [PlayerStates.WallSliding]: opts => opts.velocityY < constant_1.PLAYER_VMAX_GRAB_WALLSLIDE
            }
        }
    }
});
exports.Config = Config;
//# sourceMappingURL=PlayerAnimation.js.map