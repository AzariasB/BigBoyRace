
export class State {

    private _transitions: Transition[];

    constructor(public fsm: FiniteStateMachine, public name: string, public animation: string) {
        this._transitions = [];
    }

    public addTransition(transition: Transition) {
        this._transitions.push(transition);
    }

    public checkForTransitions(): State {
        let values = this.fsm.values;
        for (let t of this._transitions) {
            if (t.validation(values) ) return t.toState;
        }
        return null;
    }


}

type VCallback = (obj: {[key: string]: any}) => boolean;
/**
 * Transition grouping to faciliate fluent api
 */
export class Transition {

    constructor(public fsm: FiniteStateMachine) {
        this.validation = (_) => true;
    }

    public fromState: State;
    public toState: State;
    public validation: VCallback;


    /**
    * Specify the end state(s) of a transition function
    */
    public to(state: string): Transition {
        this.toState = this.fsm.getState(state);
        return this;
    }

    public when(validator: VCallback): Transition {
        this.validation = validator;
        return this;
    }


}

/**
 * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
 * with an enumeration.
 */
export class FiniteStateMachine {
    public currentState: State;
    public values: {[key: string]: any};

    private _states: {[key: string]: State};

    get currentStateName() {
        return this.currentState.name;
    }

    constructor(private animationManager: Phaser.AnimationManager) {
        this._states = {};
        this.values = {};
    }

    public setCurrentState(stateName: string): FiniteStateMachine {
        this.currentState = this.getState(stateName);
        this.animationManager.play(this.currentState.animation, 5, true);
        return this;
    }

    public addState(stateName: string, stateAnim: string): FiniteStateMachine {
        this._states[stateName] = new State(this, stateName, stateAnim);
        return this;
    }

    private updateInternalState() {
        let nwState = this.currentState.checkForTransitions();
        if (nwState) {
            this.setCurrentState(nwState.name);
        }
    }

    public setProperty(key: string, value: any): FiniteStateMachine {
        this.values[key] = value;
        this.updateInternalState();
        return this;
    }

    public setProperties(objects: {[key: string]: any}): FiniteStateMachine {
        Object.keys(objects).forEach(key => {
            this.values[key] = objects[key];
        });
        this.updateInternalState();
        return this;
    }

    /**
    * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
    */
    public from(stateName: string): Transition {
        let _transition = new Transition(this);
        _transition.fromState = this.getState(stateName);
        this.getState(stateName).addTransition(_transition);
        return _transition;
    }

    /**
     * Gets the state object from its name
     * throws an exception if the state does not exist
     *
     * @param statename name of the state to find
     * this state must have been declared before
     */
    public getState(statename: string): State {
        if (!this._states[statename]) throw `State ${statename} not found`;
        return this._states[statename];
    }

    /**
    * Whether or not the current state equals the given state
    */
    public is(stateName: string): boolean {
        return this.currentState.name === stateName;
    }

    /**
     * if the current state is one of the given states
     */
    public isOneOf(...stateNames: string[]): boolean {
        return stateNames.some(x => this.is(x));
    }
}