import { Signal } from './Signal';

/**
* @author       Miller Medeiros http://millermedeiros.github.com/js-signals/
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Object that represents a binding between a Signal and a listener function.
* This is an internal constructor and shouldn't be created directly.
* Inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
* 
* @class Phaser.SignalBinding
* @constructor
* @param {Phaser.Signal} signal - Reference to Signal object that listener is currently bound to.
* @param {function} listener - Handler function bound to the signal.
* @param {boolean} isOnce - If binding should be executed just once.
* @param {object} [listenerContext=null] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
* @param {number} [priority] - The priority level of the event listener. (default = 0).
* @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
*/
export class SignalBinding {

    constructor(private signal: Signal,
                private listener: Function,
                private _isOnce: boolean = true,
                public listenerContext: any,
                private _priority: number = 0,
                private args: any = null) {
    }


    /**
    * @property {?object} context - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    */
    public context: any = null;


    /**
    * @property {number} callCount - The number of times the handler function has been called.
    */
    private callCount: number = 0;

    /**
    * If binding is active and should be executed.
    * @property {boolean} active
    * @default
    */
    private active: boolean = true;

    /**
    * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute` (curried parameters).
    * @property {array|null} params
    * @default
    */
    private params: any[] = null;

    /**
    * Call listener passing arbitrary parameters.
    * If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.
    * @method Phaser.SignalBinding#execute
    * @param {any[]} [paramsArr] - Array of parameters that should be passed to the listener.
    * @return {any} Value returned by the listener.
    */
    execute(paramsArr: any[]): any {

        let handlerReturn, params;

        if (this.active && !!this.listener) {
            params = this.params ? this.params.concat(paramsArr) : paramsArr;

            if (this.args) {
                params = params.concat(this.args);
            }

            handlerReturn = this.listener.apply(this.context, params);

            this.callCount++;

            if (this.isOnce) {
                this.detach();
            }
        }

        return handlerReturn;

    }

    /**
    * Detach binding from signal.
    * alias to: @see mySignal.remove(myBinding.getListener());
    * @method Phaser.SignalBinding#detach
    * @return {function|null} Handler function bound to the signal or `null` if binding was previously detached.
    */
    detach(): Function|null {
        return this.isBound() ? this.signal.remove(this.listener, this.context) : null;
    }

    /**
    * @method Phaser.SignalBinding#isBound
    * @return {boolean} True if binding is still bound to the signal and has a listener.
    */
    isBound(): boolean {
        return (!!this.signal && !!this.listener);
    }

    /**
    * @method Phaser.SignalBinding#isOnce
    * @return {boolean} If SignalBinding will only be executed once.
    */
    get isOnce(): boolean {
        return this._isOnce;
    }

    get priority(): number {
        return this._priority;
    }

    /**
    * @method Phaser.SignalBinding#getListener
    * @return {function} Handler function bound to the signal.
    */
    getListener(): Function {
        return this.listener;
    }

    /**
    * @method Phaser.SignalBinding#getSignal
    * @return {Phaser.Signal} Signal that listener is currently bound to.
    */
    getSignal(): Signal {
        return this.signal;
    }

    /**
    * Delete instance properties
    * @method Phaser.SignalBinding#_destroy
    * @private
    */
    public destroy() {
        delete this.signal;
        delete this.listener;
        delete this.context;
    }

    /**
    * @method Phaser.SignalBinding#toString
    * @return {string} String representation of the object.
    */
    toString(): string {
        return '[Phaser.SignalBinding isOnce:' + this._isOnce + ', isBound:' + this.isBound() + ', active:' + this.active + ']';
    }

}