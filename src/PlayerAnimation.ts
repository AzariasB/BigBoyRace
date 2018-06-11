
export enum PlayerStates {
    Running = 'Running',
    Idle = 'Idle',
    Crouched = 'Crouched',
    SlideCrouched = 'SlideCrouched',
    WallSliding = 'WallSliding',
    CrouchWalking = 'CrouchWalking',
    Jumping = 'Jumping',
    Landing = 'Landing'
}


export enum PlayerAnimation {
    Run = 'run_right',
    Idle = 'idle',
    Crouch = 'crouch',
    JumpCrouch = 'jum_crouch',
    SlideCrouch = 'slide_crouch',
    WalkCrouch = 'walk_crouch',
    WallSliding = 'wall_sliding',
    Jump = 'jump',
    Land = 'land'
}

export class AnimationConfiguration {
    public states: {[key: string]:
        {
            animation: {
                name: PlayerAnimation,
                frameRate: number,
                loop: boolean
            },
            transitions: {[key: string]: (o: any) => boolean}
        }
    };

    constructor(init?: Partial<AnimationConfiguration>) {
        Object.assign(this, init);
    }
}

const Config: AnimationConfiguration = new AnimationConfiguration({
    states: {
        [PlayerStates.Idle]: {
            animation: {
                name: PlayerAnimation.Idle,
                loop: true,
                frameRate: 5
            },
            transitions: {
                [PlayerStates.Crouched]: opts => opts.isCrouchPressed,
                [PlayerStates.Jumping]: opts => opts.isJumpPressed,
                [PlayerStates.Running]: opts => opts.velocityX !== 0
            }
        },
        [PlayerStates.Running]: {
            animation: {
                name: PlayerAnimation.Run,
                loop: true,
                frameRate: 20
            },
            transitions: {
                [PlayerStates.SlideCrouched]: opts => opts.isCrouchPressed,
                [PlayerStates.Jumping]: opts => opts.velocityY !== 0 ,
                [PlayerStates.Idle]: opts => opts.isOnFloor && opts.velocityX === 0
            }
        },
        [PlayerStates.SlideCrouched]: {
            animation: {
                name: PlayerAnimation.JumpCrouch,
                loop: false,
                frameRate: 5
            },
            transitions: {
                [PlayerStates.Crouched]: opts => opts.velocityX === 0,
                [PlayerStates.Running]: opts => opts.velocityX !== 0 && !opts.isStuck
                // could add a state to go from sliding to iddle ?
            }
        },
        [PlayerStates.Crouched]: {
            animation: {
                name: PlayerAnimation.Crouch,
                loop: true,
                frameRate: 5
            },
            transitions: {
                [PlayerStates.CrouchWalking]: opts => opts.velocityX !== 0,
                [PlayerStates.Idle]: opts => !opts.isStuck && !opts.isCrouchPressed,
            }
        },
        [PlayerStates.CrouchWalking]: {
            animation: {
                name: PlayerAnimation.WalkCrouch,
                loop: true,
                frameRate: 5
            },
            transitions: {
                [PlayerStates.Running]: opts => !opts.isCrouchPressed && !opts.isStuck,
                [PlayerStates.Jumping]: opts => !opts.isOnFloor,
                [PlayerStates.Crouched]: opts => opts.velocityX === 0
            }
        },
        [PlayerStates.Jumping]: {
            animation: {
                name: PlayerAnimation.Jump,
                loop: true,
                frameRate: 5
            },
            transitions: {
                [PlayerStates.Running]: opts => opts.isOnFloor && opts.velocityX !== 0,
                [PlayerStates.Idle]: opts => opts.isOnFloor && opts.velocityX === 0,
                [PlayerStates.WallSliding]: opts => !opts.isOnFloor && opts.isOnWall
            }
        },
        [PlayerStates.WallSliding]: {
            animation: {
                name: PlayerAnimation.WallSliding,
                loop: true,
                frameRate: 10
            },
            transitions: {
                [PlayerStates.Jumping]: opts => opts.isJumpPressed || ( !opts.isOnWall && !opts.isOnFloor),
                [PlayerStates.Idle]: opts => opts.isOnFloor // && opts.velocityX === 0
            }
        }
    }
});

export {Config};