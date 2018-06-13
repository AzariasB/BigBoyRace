"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Network contants
var N_INPUT;
(function (N_INPUT) {
    N_INPUT[N_INPUT["UP"] = 0] = "UP";
    N_INPUT[N_INPUT["RIGHT"] = 1] = "RIGHT";
    N_INPUT[N_INPUT["DOWN"] = 2] = "DOWN";
    N_INPUT[N_INPUT["LEFT"] = 3] = "LEFT";
    N_INPUT[N_INPUT["ACTION"] = 4] = "ACTION";
    N_INPUT[N_INPUT["LENGTH"] = 5] = "LENGTH";
})(N_INPUT = exports.N_INPUT || (exports.N_INPUT = {}));
exports.N_PLAYERS = 1;
exports.N_PATH = '/grace';
exports.N_PORT = 9000;
exports.N_SEND_INPUTS = 15; // ms
// Player related constants
exports.PLAYER_SPEED = {
    RUNNING: 170,
    CROUCH: 80,
    JUMP: 120
};
exports.PLAYER_ACCELERATION = 1.005;
exports.PLAYER_JUMP = 350;
exports.PLAYER_WALLJUMP = 400;
exports.PLAYER_DESCELERATION = 1.007;
exports.WALLJUMP_IGNORE_TIME = 50; // ms
exports.MAX_FALL_SPEED = 700; // speed where the player can't wall slide
// World related constants
exports.WORLD_GRAVITY = 800;
// Powerup related constants
//# sourceMappingURL=constant.js.map