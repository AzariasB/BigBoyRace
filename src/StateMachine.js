"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class State {
    constructor(fsm, name, animation = '') {
        this.fsm = fsm;
        this.name = name;
        this.animation = animation;
        this._transitions = [];
    }
    addTransition(transition) {
        this._transitions.push(transition);
    }
    checkForTransitions() {
        let values = this.fsm.values;
        for (let t of this._transitions) {
            if (t.validation(values))
                return t.toState;
        }
        return null;
    }
}
exports.State = State;
/**
 * Transition grouping to faciliate fluent api
 */
class Transition {
    constructor(fsm) {
        this.fsm = fsm;
        this.validation = (_) => true;
    }
    /**
    * Specify the end state(s) of a transition function
    */
    to(state) {
        this.toState = this.fsm.getState(state);
        return this;
    }
    when(validator) {
        this.validation = validator;
        return this;
    }
}
exports.Transition = Transition;
/**
 * A simple finite state machine implemented in TypeScript, the templated argument is meant to be used
 * with an enumeration.
 */
class FiniteStateMachine {
    constructor(animationManager = null) {
        this.animationManager = animationManager;
        this._states = {};
        this.values = {};
    }
    get currentStateName() {
        return this.currentState.name;
    }
    setCurrentState(stateName) {
        this.currentState = this.getState(stateName);
        if (this.animationManager)
            this.animationManager.play(this.currentState.animation);
        return this;
    }
    addState(stateName, stateAnim) {
        this._states[stateName] = new State(this, stateName, stateAnim);
        return this;
    }
    updateInternalState() {
        let nwState = this.currentState.checkForTransitions();
        if (nwState) {
            this.setCurrentState(nwState.name);
        }
    }
    setProperty(key, value) {
        this.values[key] = value;
        this.updateInternalState();
        return this;
    }
    setProperties(objects) {
        Object.keys(objects).forEach(key => {
            this.values[key] = objects[key];
        });
        this.updateInternalState();
        return this;
    }
    /**
    * Declares the start state(s) of a transition function, must be followed with a '.to(...endStates)'
    */
    from(stateName) {
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
    getState(statename) {
        if (!this._states[statename])
            throw `State ${statename} not found`;
        return this._states[statename];
    }
    /**
    * Whether or not the current state equals the given state
    */
    is(stateName) {
        return this.currentState.name === stateName;
    }
    /**
     * if the current state is one of the given states
     */
    isOneOf(...stateNames) {
        return stateNames.some(x => this.is(x));
    }
}
exports.FiniteStateMachine = FiniteStateMachine;
//# sourceMappingURL=StateMachine.js.map