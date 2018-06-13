// Network contants
export enum N_INPUT {
    UP,
    RIGHT,
    DOWN,
    LEFT,
    ACTION,
    LENGTH
}

export const N_PLAYERS = 1;
export const N_PATH = '/grace';
export const N_PORT = 9000;
export const N_SEND_INPUTS = 15; // ms
export const N_MAX_DISTANE = 200;

// Player related constants
export const PLAYER_SPEED = {
    RUNNING : 170,
    CROUCH : 80,
    JUMP : 100
};
export const PLAYER_ACCELERATION = 1.005;
export const PLAYER_JUMP = 350;
export const PLAYER_WALLJUMP = 400;
export const PLAYER_DESCELERATION = 1.007;
export const PLAYER_VMAX_GRAB_WALLSLIDE = 500;

// World related constants
export const WORLD_GRAVITY = 800;

// Powerup related constants