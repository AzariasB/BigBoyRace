
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
            animation: PlayerAnimation,
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
                [PlayerStates.Jumping]: opts => opts.velocityY !== 0 ,
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
                [PlayerStates.WallSliding]: opts => !opts.isOnFloor && opts.isOnWall && opts.velocityY > 0
            }
        },
        [PlayerStates.WallSliding]: {
            animation:  PlayerAnimation.WallSliding,
            transitions: {
                [PlayerStates.Jumping]: opts => !opts.isOnWall && !opts.isOnFloor,
                [PlayerStates.Idle]: opts => opts.isOnFloor // && opts.velocityX === 0
            }
        }
    }
});

export {Config};