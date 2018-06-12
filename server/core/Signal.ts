import { SignalBinding } from './SignalBinding';

/**
* @author       Miller Medeiros http://millermedeiros.github.com/js-signals/
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* Signals are what Phaser uses to handle events and event dispatching.
* You can listen for a Signal by binding a callback / function to it.
* This is done by using either `Signal.add` or `Signal.addOnce`.
*
* For example you can listen for a touch or click event from the Input Manager
* by using its `onDown` Signal:
*
* `game.input.onDown.add(function() { ... });`
*
* Rather than inline your function, you can pass a reference:
*
* `game.input.onDown.add(clicked, this);`
* `function clicked () { ... }`
*
* In this case the second argument (`this`) is the context in which your function should be called.
*
* Now every time the InputManager dispatches the `onDown` signal (or event), your function
* will be called.
*
* Multiple callbacks can be bound to the same signal.
* They're ordered first by their `priority` arguments and then by the order in which they were added.
* If a callback calls {@link #halt} or returns `false`, any remaining callbacks are skipped.
*
* Very often a Signal will send arguments to your function.
* This is specific to the Signal itself.
* If you're unsure then check the documentation, or failing that simply do:
*
* `Signal.add(function() { console.log(arguments); })`
*
* and it will log all of the arguments your function received from the Signal.
*
* Sprites have lots of default signals you can listen to in their Events class, such as:
*
* `sprite.events.onKilled`
*
* Which is called automatically whenever the Sprite is killed.
* There are lots of other events, see the Events component for a list.
*
* As well as listening to pre-defined Signals you can also create your own:
*
* `var mySignal = new Phaser.Signal();`
*
* This creates a new Signal. You can bind a callback to it:
*
* `mySignal.add(myCallback, this);`
*
* and then finally when ready you can dispatch the Signal:
*
* `mySignal.dispatch(your arguments);`
*
* And your callback will be invoked. See the dispatch method for more details.
*
* @class Phaser.Signal
* @constructor
*/
export class Signal {

    constructor() {}

    /**
    * @property {?Array.<Phaser.SignalBinding>} bindings - Internal variable.
    * @private
    */
   private bindings: SignalBinding[] = null;

    /**
    * @property {any} _prevParams - Internal variable.
    * @private
    */
    private prevParams: any = null;

    /**
    * Memorize the previously dispatched event?
    *
    * If an event has been memorized it is automatically dispatched when a new listener is added with {@link #add} or {@link #addOnce}.
    * Use {@link #forget} to clear any currently memorized event.
    *
    * @property {boolean} memorize
    */
    public memorize: boolean = false;

    /**
    * @property {boolean} _shouldPropagate
    * @private
    */
    private shouldPropagate: boolean =  true;

    /**
    * Is the Signal active? Only active signals will broadcast dispatched events.
    *
    * Setting this property during a dispatch will only affect the next dispatch. To stop the propagation of a signal from a listener use {@link #halt}.
    *
    * @property {boolean} active
    * @default
    */
    public active: boolean =  true;

    /**
    * @property {function} _boundDispatch - The bound dispatch function, if any.
    * @private
    */
    private _boundDispatch: Function = null;

    /**
    * @method Phaser.Signal#_registerListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {boolean} isOnce - Should the listener only be called once?
    * @param {object} [listenerContext] - The context under which the listener is invoked.
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0).
    * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    private registerListener(listener: Function, isOnce: boolean, listenerContext?: object, priority?: number, args: any[] = []): SignalBinding {

        let prevIndex = this.indexOfListener(listener, listenerContext);
        let binding;

        if (prevIndex !== -1) {
            binding = this.bindings[prevIndex];

            if (binding.isOnce() !== isOnce) {
                throw new Error('You cannot add' + (isOnce ? '' : 'Once') + '() then add' + (!isOnce ? '' : 'Once') + '() the same listener without removing the relationship first.');
            }
        } else {
            binding = new SignalBinding(this, listener, isOnce, listenerContext, priority, args);
            this.addBinding(binding);
        }

        if (this.memorize && this.prevParams) {
            binding.execute(this.prevParams);
        }

        return binding;

    }

    /**
    * @method Phaser.Signal#_addBinding
    * @private
    * @param {Phaser.SignalBinding} binding - An Object representing the binding between the Signal and listener.
    */
    private addBinding(binding: SignalBinding) {

        if (!this.bindings) {
            this.bindings = [];
        }

        //  Simplified insertion sort
        let n = this.bindings.length;

        do {
            n--;
        }
        while (this.bindings[n] && binding.priority <= this.bindings[n].priority);

        this.bindings.splice(n + 1, 0, binding);

    }

    /**
    * @method Phaser.Signal#_indexOfListener
    * @private
    * @param {function} listener - Signal handler function.
    * @param {object} [context=null] - Signal handler function.
    * @return {number} The index of the listener within the private bindings array.
    */
    private indexOfListener(listener: Function, context: any = null): number {

        if (!this.bindings) {
            return -1;
        }

        if (context === undefined) { context = null; }

        let n = this.bindings.length;
        let cur;

        while (n--) {
            cur = this.bindings[n];

            if (cur._listener === listener && cur.context === context) {
                return n;
            }
        }

        return -1;

    }

    /**
    * Check if a specific listener is attached.
    *
    * @method Phaser.Signal#has
    * @param {function} listener - Signal handler function.
    * @param {object} [context] - Context on which listener will be executed (object that should represent the `this` variable inside listener function).
    * @return {boolean} If Signal has the specified listener.
    */
    has(listener: Function, context: any): boolean {

        return this.indexOfListener(listener, context) !== -1;

    }

    /**
    * Add an event listener for this signal.
    *
    * An event listener is a callback with a related context and priority.
    *
    * You can optionally provide extra arguments which will be passed to the callback after any internal parameters.
    *
    * For example: `Phaser.Key.onDown` when dispatched will send the Phaser.Key object that caused the signal as the first parameter.
    * Any arguments you've specified after `priority` will be sent as well:
    *
    * `fireButton.onDown.add(shoot, this, 0, 'lazer', 100);`
    *
    * When onDown dispatches it will call the `shoot` callback passing it: `Phaser.Key, 'lazer', 100`.
    *
    * Where the first parameter is the one that Key.onDown dispatches internally and 'lazer',
    * and the value 100 were the custom arguments given in the call to 'add'.
    *
    * If the callback calls {@link #halt} or returns `false`, any remaining callbacks bound to this Signal are skipped.
    *
    * @method Phaser.Signal#add
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    add(listener: Function, listenerContext: any, priority: number = 0, ...args: any[]): SignalBinding {

        return this.registerListener(listener, false, listenerContext, priority, args);

    }

    /**
    * Add a one-time listener - the listener is automatically removed after the first execution.
    *
    * If there is as {@link Phaser.Signal#memorize memorized} event then it will be dispatched and
    * the listener will be removed immediately.
    *
    * @method Phaser.Signal#addOnce
    * @param {function} listener - The function to call when this Signal is dispatched.
    * @param {object} [listenerContext] - The context under which the listener will be executed (i.e. the object that should represent the `this` variable).
    * @param {number} [priority] - The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added (default = 0)
    * @param {...any} [args=(none)] - Additional arguments to pass to the callback (listener) function. They will be appended after any arguments usually dispatched.
    * @return {Phaser.SignalBinding} An Object representing the binding between the Signal and listener.
    */
    addOnce(listener: Function, listenerContext: any, priority: number, ...args: any[]): SignalBinding {

        return this.registerListener(listener, true, listenerContext, priority, args);

    }

    /**
    * Remove a single event listener.
    *
    * @method Phaser.Signal#remove
    * @param {function} listener - Handler function that should be removed.
    * @param {object} [context=null] - Execution context (since you can add the same handler multiple times if executing in a different context).
    * @return {function} Listener handler function.
    */
    remove(listener: Function, context: any = null): Function {

        let i = this.indexOfListener(listener, context);

        if (i !== -1) {
            this.bindings[i].destroy(); // no reason to a Phaser.SignalBinding exist if it isn't attached to a signal
            this.bindings.splice(i, 1);
        }

        return listener;

    }

    /**
    * Remove all event listeners.
    *
    * @method Phaser.Signal#removeAll
    * @param {object} [context=null] - If specified only listeners for the given context will be removed.
    */
    removeAll(context: any = null) {

        if (!this.bindings) {
            return;
        }

        let n = this.bindings.length;

        while (n--) {
            if (context) {
                if (this.bindings[n].context === context) {
                    this.bindings[n].destroy();
                    this.bindings.splice(n, 1);
                }
            } else {
                this.bindings[n].destroy();
            }
        }

        if (!context) {
            this.bindings.length = 0;
        }

    }

    /**
    * Gets the total number of listeners attached to this Signal.
    *
    * @method Phaser.Signal#getNumListeners
    * @return {integer} Number of listeners attached to the Signal.
    */
    getNumListeners(): number {

        return this.bindings ? this.bindings.length : 0;

    }

    /**
    * Stop propagation of the event, blocking the dispatch to next listener on the queue.
    *
    * This should be called only during event dispatch as calling it before/after dispatch won't affect another broadcast.
    * See {@link #active} to enable/disable the signal entirely.
    *
    * @method Phaser.Signal#halt
    */
    halt(): void {

        this.shouldPropagate = false;

    }

    /**
    * Dispatch / broadcast the event to all listeners.
    *
    * To create an instance-bound dispatch for this Signal, use {@link #boundDispatch}.
    *
    * @method Phaser.Signal#dispatch
    * @param {any} [params] - Parameters that should be passed to each handler.
    */
    dispatch (...args: any[]) {

        if (!this.active || (!this.bindings && !this.memorize)) {
            return;
        }

        if (this.memorize) {
            this.prevParams = args;
        }

        let n = this.bindings ? this.bindings.length : 0;

        if (!n) {
            //  Should come after memorize
            return;
        }

        let bindings = this.bindings.slice(); // clone array in case add/remove items during dispatch
        this.shouldPropagate = true; // in case `halt` was called before dispatch or during the previous dispatch.

        // execute all callbacks until end of the list or until a callback returns `false` or stops propagation
        // reverse loop since listeners with higher priority will be added at the end of the list
        do {
            n--;
        }
        while (bindings[n] && this.shouldPropagate && bindings[n].execute(args) !== false);

    }

    /**
    * Forget the currently {@link Phaser.Signal#memorize memorized} event, if any.
    *
    * @method Phaser.Signal#forget
    */
    forget() {

        if (this.prevParams) {
            this.prevParams = null;
        }

    }

    /**
    * Dispose the signal - no more events can be dispatched.
    *
    * This removes all event listeners and clears references to external objects.
    * Calling methods on a disposed objects results in undefined behavior.
    *
    * @method Phaser.Signal#dispose
    */
    dispose() {

        this.removeAll();

        this.bindings = null;
        if (this.prevParams) {
            this.prevParams = null;
        }

    }

    /**
    * A string representation of the object.
    *
    * @method Phaser.Signal#toString
    * @return {string} String representation of the object.
    */
    toString(): string {

        return '[Phaser.Signal active:' + this.active + ' numListeners:' + this.getNumListeners() + ']';

    }

    get boundDispatch() {
        return this._boundDispatch || (this._boundDispatch =  (...args) =>  this.dispatch.apply(this, args));
    }

}
