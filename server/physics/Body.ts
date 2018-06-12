import { Rectangle } from '../geom/Rectangle';
import { Point } from '../geom/Point';
import { Line } from '../geom/Line';
import { Signal } from '../core/Signal';
import { Facing, MMaths } from './Math';
import { World } from './World';

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Physics Body is linked to a single Sprite. All physics operations should be performed against the body rather than
* the Sprite itself. For example you can set the velocity, acceleration, bounce values etc all on the Body.
*
* @class Phaser.Physics.Arcade.Body
* @constructor
* @param {Phaser.Sprite} sprite - The Sprite object this physics body belongs to.
*/
export class Body extends Rectangle {

    constructor(x: number, y: number, width: number, height: number, public world: World) {
        super(x, y, width, height);
        this.position = new Point(x, y);
        this.prev = new Point(x, y);
        this.sourceWidth = width;
        this.sourceHeight = height;
    }

    /**
    * @property {boolean} enable - A disabled body won't be checked for any form of collision or overlap or have its pre/post updates run.
    * @default
    */
    public enable: boolean = true;

    /**
    * @property {Phaser.Point} position - The position of the physics body, equivalent to ({@link #left}, {@link #top}).
    * @readonly
    */
    public position: Point;

    /**
    * @property {Phaser.Point} prev - The previous position of the physics body.
    * @readonly
    */
    public prev: Point;

    /**
    * @property {number} sourceWidth - The un-scaled original size.
    * @readonly
    */
    public sourceWidth: number;

    /**
    * @property {number} sourceHeight - The un-scaled original size.
    * @readonly
    */
    public sourceHeight: number;

    /**
    * @property {Phaser.Point} velocity - The velocity, or rate of change the Body's position. Measured in pixels per second.
    */
    public velocity: Point = new Point();

    /**
    * @property {Phaser.Point} newVelocity - The distanced traveled during the last update, equal to `velocity * physicsElapsed`. Calculated during the Body.preUpdate and applied to its position.
    * @readonly
    */
    public newVelocity: Point = new Point();

    /**
    * @property {Phaser.Point} deltaMax - The Sprite position is updated based on the delta x/y values. You can set a cap on those (both +-) using deltaMax.
    */
    public deltaMax: Point = new Point();

    /**
    * @property {Phaser.Point} acceleration - The acceleration is the rate of change of the velocity. Measured in pixels per second squared.
    */
    public acceleration: Point = new Point();

    /**
     * @property {boolean} allowDrag - Allow this Body to be influenced by {@link #drag}?
     * @default
     */
    public allowDrag: boolean = true;

    /**
    * @property {Phaser.Point} drag - The drag applied to the motion of the Body (when {@link #allowDrag} is enabled). Measured in pixels per second squared.
    */
    public drag: Point = new Point();

    /**
    * @property {boolean} allowGravity - Allow this Body to be influenced by gravity? Either world or local.
    * @default
    */
    public allowGravity: boolean = true;

    /**
    * @property {Phaser.Point} gravity - This Body's local gravity, **added** to any world gravity, unless Body.allowGravity is set to false.
    */
    public gravity: Point = new Point();

    /**
    * @property {Phaser.Point} bounce - The elasticity of the Body when colliding. bounce.x/y = 1 means full rebound, bounce.x/y = 0.5 means 50% rebound velocity.
    */
    public bounce: Point = new Point();

    /**
    * The elasticity of the Body when colliding with the World bounds.
    * By default this property is `null`, in which case `Body.bounce` is used instead. Set this property
    * to a Phaser.Point object in order to enable a World bounds specific bounce value.
    * @property {Phaser.Point} worldBounce
    */
    public worldBounce: Point = null;

    /**
    * A Signal that is dispatched when this Body collides with the world bounds.
    * Due to the potentially high volume of signals this could create it is disabled by default.
    * To use this feature set this property to a Phaser.Signal: `sprite.body.onWorldBounds = new Phaser.Signal()`
    * and it will be called when a collision happens, passing five arguments:
    * `onWorldBounds(sprite, up, down, left, right)`
    * where the Sprite is a reference to the Sprite that owns this Body, and the other arguments are booleans
    * indicating on which side of the world the Body collided.
    * @property {Phaser.Signal} onWorldBounds
    */
    public onWorldBounds: Signal = null;

    /**
    * A Signal that is dispatched when this Body collides with another Body.
    *
    * You still need to call `game.physics.arcade.collide` in your `update` method in order
    * for this signal to be dispatched.
    *
    * Usually you'd pass a callback to the `collide` method, but this signal provides for
    * a different level of notification.
    *
    * Due to the potentially high volume of signals this could create it is disabled by default.
    *
    * To use this feature set this property to a Phaser.Signal: `sprite.body.onCollide = new Phaser.Signal()`
    * and it will be called when a collision happens, passing two arguments: the sprites which collided.
    * The first sprite in the argument is always the owner of this Body.
    *
    * If two Bodies with this Signal set collide, both will dispatch the Signal.
    * @property {Phaser.Signal} onCollide
    */
    public onCollide: Signal = null;

    /**
    * A Signal that is dispatched when this Body overlaps with another Body.
    *
    * You still need to call `game.physics.arcade.overlap` in your `update` method in order
    * for this signal to be dispatched.
    *
    * Usually you'd pass a callback to the `overlap` method, but this signal provides for
    * a different level of notification.
    *
    * Due to the potentially high volume of signals this could create it is disabled by default.
    *
    * To use this feature set this property to a Phaser.Signal: `sprite.body.onOverlap = new Phaser.Signal()`
    * and it will be called when a collision happens, passing two arguments: the sprites which collided.
    * The first sprite in the argument is always the owner of this Body.
    *
    * If two Bodies with this Signal set collide, both will dispatch the Signal.
    * @property {Phaser.Signal} onOverlap
    */
    public onOverlap: Signal = null;

    /**
    * @property {Phaser.Point} maxVelocity - The maximum velocity (in pixels per second squared) that the Body can reach.
    * @default
    */
    public maxVelocity: Point = new Point(10000, 10000);

    /**
    * @property {Phaser.Point} friction - If this Body is {@link #immovable} and moving, and another Body is 'riding' this one, this is the amount of motion the riding Body receives on each axis.
    */
    public friction: Point = new Point(1, 0);

    /**
    * @property {number} mass - The mass of the Body. When two bodies collide their mass is used in the calculation to determine the exchange of velocity.
    * @default
    */
    public mass: number = 1;

    /**
    * @property {number} angle - The angle of the Body's **velocity** in radians.
    * @readonly
    */
    public angle: number = 0;

    /**
    * @property {number} speed - The speed of the Body in pixels per second, equal to the magnitude of the velocity.
    * @readonly
    */
    public speed: number = 0;

    /**
    * @property {number} facing - A const reference to the direction the Body is traveling or facing: Phaser.NONE, Phaser.LEFT, Phaser.RIGHT, Phaser.UP, or Phaser.DOWN. If the Body is moving on both axes, UP and DOWN take precedence.
    * @default
    */
    public facing: Facing = Facing.NONE;

    /**
    * @property {boolean} immovable - An immovable Body will not receive any impacts from other bodies. **Two** immovable Bodies can't separate or exchange momentum and will pass through each other.
    * @default
    */
    public immovable: boolean = false;

    /**
    * Whether the physics system should update the Body's position and rotation based on its velocity, acceleration, drag, and gravity.
    *
    * If you have a Body that is being moved around the world via a tween or a Group motion, but its local x/y position never
    * actually changes, then you should set Body.moves = false. Otherwise it will most likely fly off the screen.
    * If you want the physics system to move the body around, then set moves to true.
    *
    * A Body with moves = false can still be moved slightly (but not accelerated) during collision separation unless you set {@link #immovable} as well.
    *
    * @property {boolean} moves - Set to true to allow the Physics system to move this Body, otherwise false to move it manually.
    * @default
    */
    public moves: boolean = true;

    /**
    * This flag allows you to disable the custom x separation that takes place by Physics.Arcade.separate.
    * Used in combination with your own collision processHandler you can create whatever type of collision response you need.
    * @property {boolean} customSeparateX - Use a custom separation system or the built-in one?
    * @default
    */
    public customSeparateX: boolean = false;

    /**
    * This flag allows you to disable the custom y separation that takes place by Physics.Arcade.separate.
    * Used in combination with your own collision processHandler you can create whatever type of collision response you need.
    * @property {boolean} customSeparateY - Use a custom separation system or the built-in one?
    * @default
    */
    public customSeparateY: boolean = false;

    /**
    * When this body collides with another, the amount of overlap is stored here.
    * @property {number} overlapX - The amount of horizontal overlap during the collision.
    */
    public overlapX: number = 0;

    /**
    * When this body collides with another, the amount of overlap is stored here.
    * @property {number} overlapY - The amount of vertical overlap during the collision.
    */
    public overlapY: number = 0;

    /**
    * If a body is overlapping with another body, but neither of them are moving (maybe they spawned on-top of each other?) this is set to true.
    * @property {boolean} embedded - Body embed value.
    */
    public embedded: boolean = false;

    /**
    * A Body can be set to collide against the World bounds automatically and rebound back into the World if this is set to true. Otherwise it will leave the World.
    * @property {boolean} collideWorldBounds - Should the Body collide with the World bounds?
    */
    public collideWorldBounds: boolean = false;

    /**
    * Set the checkCollision properties to control which directions collision is processed for this Body.
    * For example checkCollision.up = false means it won't collide when the collision happened while moving up.
    * If you need to disable a Body entirely, use `body.enable = false`, this will also disable motion.
    * If you need to disable just collision and/or overlap checks, but retain motion, set `checkCollision.none = true`.
    * @property {object} checkCollision - An object containing allowed collision (none, up, down, left, right).
    */
    public checkCollision = { none: false, up: true, down: true, left: true, right: true };

    /**
    * This object is populated with boolean values when the Body collides with another.
    * touching.up = true means the collision happened to the top of this Body for example.
    * @property {object} touching - An object containing touching results (none, up, down, left, right).
    */
    public touching = { none: true, up: false, down: false, left: false, right: false };

    /**
    * This object is populated with previous touching values from the bodies previous collision.
    * @property {object} wasTouching - An object containing previous touching results (none, up, down, left, right).
    */
    public wasTouching = { none: true, up: false, down: false, left: false, right: false };

    /**
    * This object is populated with boolean values when the Body collides with the World bounds or a Tile.
    * For example if blocked.up is true then the Body cannot move up.
    * @property {object} blocked - An object containing on which faces this Body is blocked from moving, if any (none, up, down, left, right).
    */
    public blocked = { none: true, up: false, down: false, left: false, right: false };

    /**
    * If this is an especially small or fast moving object then it can sometimes skip over tilemap collisions if it moves through a tile in a step.
    * Set this padding value to add extra padding to its bounds. tilePadding.x applied to its width, y to its height.
    * @property {Phaser.Point} tilePadding - Extra padding to be added to this sprite's dimensions when checking for tile collision.
    */
    public tilePadding: Point = new Point();

    /**
    * @property {boolean} dirty - If this Body in a preUpdate (true) or postUpdate (false) state?
    */
    public dirty: boolean = false;

    /**
    * @property {boolean} skipQuadTree - If true and you collide this Sprite against a Group, it will disable the collision check from using a QuadTree.
    */
    public skipQuadTree: boolean = false;

    /**
    * If true the Body will check itself against the Sprite.getBounds() dimensions and adjust its width and height accordingly.
    * If false it will compare its dimensions against the Sprite scale instead, and adjust its width height if the scale has changed.
    * Typically you would need to enable syncBounds if your sprite is the child of a responsive display object such as a FlexLayer,
    * or in any situation where the Sprite scale doesn't change, but its parents scale is effecting the dimensions regardless.
    * @property {boolean} syncBounds
    * @default
    */
    public syncBounds: boolean = false;

    /**
    * @property {boolean} isMoving - Set by the `moveTo` and `moveFrom` methods.
    */
    public isMoving: boolean = false;

    /**
    * @property {boolean} stopVelocityOnCollide - Set by the `moveTo` and `moveFrom` methods.
    */
    public stopVelocityOnCollide: boolean = true;

    /**
    * @property {integer} moveTimer - Internal time used by the `moveTo` and `moveFrom` methods.
    * @private
    */
    public moveTimer: number = 0;

    /**
    * @property {integer} moveDistance - Internal distance value, used by the `moveTo` and `moveFrom` methods.
    * @private
    */
    public moveDistance: number = 0;

    /**
    * @property {integer} moveDuration - Internal duration value, used by the `moveTo` and `moveFrom` methods.
    * @private
    */
    public moveDuration: number = 0;

    /**
    * @property {Phaser.Line} moveTarget - Set by the `moveTo` method, and updated each frame.
    * @private
    */
    private moveTarget: Line = null;

    /**
    * @property {Phaser.Point} moveEnd - Set by the `moveTo` method, and updated each frame.
    * @private
    */
    private moveEnd: Point = null;

    /**
    * @property {Phaser.Signal} onMoveComplete - Listen for the completion of `moveTo` or `moveFrom` events.
    */
    public onMoveComplete = new Signal();

    /**
    * @property {function} movementCallback - Optional callback. If set, invoked during the running of `moveTo` or `moveFrom` events.
    */
    public movementCallback = Function;

    /**
    * @property {object} movementCallbackContext - Context in which to call the movementCallback.
    */
    public movementCallbackContext: any = null;

    /**
    * @property {boolean} _reset - Internal cache var.
    * @private
    */
    private  _reset: boolean = true;

    /**
    * @property {number} _sx - Internal cache var.
    * @private
    */
    private _sx: number = 1;

    /**
    * @property {number} _sy - Internal cache var.
    * @private
    */
    private _sy: number = 1;

    /**
    * @property {number} _dx - Internal cache var.
    * @private
    */
    private _dx: number = 0;

    /**
    * @property {number} _dy - Internal cache var.
    * @private
    */
    private _dy: number = 0;


    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#updateBounds
    * @protected
    protected updateBounds() {

        if (this.syncBounds) {
            this.ceilAll();

            if (this.width !== this.width || b.height !== this.height)
            {
                this.width = b.width;
                this.height = b.height;
                this._reset = true;
            }
        }
        else
        {
            let asx = Math.abs(this.sprite.scale.x);
            let asy = Math.abs(this.sprite.scale.y);

            if (asx !== this._sx || asy !== this._sy)
            {
                this.width = this.sourceWidth * asx;
                this.height = this.sourceHeight * asy;
                this._sx = asx;
                this._sy = asy;
                this._reset = true;
            }
        }

        if (this._reset)
        {
            this.halfWidth = Math.floor(this.width / 2);
            this.halfHeight = Math.floor(this.height / 2);
            this.updateCenter();
        }

    },
    */

    /**
    * Update the Body's center from its position.
    *
    * @method Phaser.Physics.Arcade.Body#updateCenter
    * @protected
    */
    protected updateCenter() {

        this.centerX = this.position.x + this.halfWidth;
        this.centerY = this.position.y + this.halfWidth;

    }

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#preUpdate
    * @protected
    */
    protected preUpdate() {

        if (!this.enable) {
            return;
        }

        this.dirty = true;

        //  Store and reset collision flags
        this.wasTouching.none = this.touching.none;
        this.wasTouching.up = this.touching.up;
        this.wasTouching.down = this.touching.down;
        this.wasTouching.left = this.touching.left;
        this.wasTouching.right = this.touching.right;

        this.touching.none = true;
        this.touching.up = false;
        this.touching.down = false;
        this.touching.left = false;
        this.touching.right = false;

        this.blocked.none = true;
        this.blocked.up = false;
        this.blocked.down = false;
        this.blocked.left = false;
        this.blocked.right = false;

        this.overlapX = 0;
        this.overlapY = 0;

        this.embedded = false;

        this.updateCenter();

        if (this._reset) {
            this.prev.x = this.position.x;
            this.prev.y = this.position.y;
        }

        if (this.moves) {
            this.world.updateMotion(this);

            this.newVelocity.set(this.velocity.x * this.world.physicsElapsed, this.velocity.y * this.world.physicsElapsed);

            this.position.x += this.newVelocity.x;
            this.position.y += this.newVelocity.y;
            this.updateCenter();

            this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

            //  Now the State update will throw collision checks at the Body
            //  And finally we'll integrate the new position back to the Sprite in postUpdate

            if (this.collideWorldBounds) {
                if (this.checkWorldBounds() && this.onWorldBounds) {
                    this.onWorldBounds.dispatch(this, this.blocked.up, this.blocked.down, this.blocked.left, this.blocked.right);
                }
            }
        }

        this._dx = this.deltaX();
        this._dy = this.deltaY();

        this._reset = false;

    }

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#updateMovement
    * @protected
    */
    updateMovement() {

        let percent = 0;
        let collided = (this.overlapX !== 0 || this.overlapY !== 0);
        let result;

        //  Duration or Distance based?

        if (this.moveDuration > 0) {
            this.moveTimer += this.world.elapsedMS;

            percent = this.moveTimer / this.moveDuration;
        }
        else {
            this.moveTarget.end.set(this.position.x, this.position.y);

            percent = this.moveTarget.length / this.moveDistance;
        }

        if (this.movementCallback) {
            result = this.movementCallback.call(this.movementCallbackContext, this, this.velocity, percent);
        }

        if (collided || percent >= 1 || (result !== undefined && result !== true)) {
            this.stopMovement((percent >= 1) || (this.stopVelocityOnCollide && collided));
            return false;
        }

        return true;

    }

    /**
    * If this Body is moving as a result of a call to `moveTo` or `moveFrom` (i.e. it
    * has Body.isMoving true), then calling this method will stop the movement before
    * either the duration or distance counters expire.
    *
    * The `onMoveComplete` signal is dispatched.
    *
    * @method Phaser.Physics.Arcade.Body#stopMovement
    * @param {boolean} [stopVelocity] - Should the Body.velocity be set to zero?
    */
    stopMovement(stopVelocity?: boolean) {

        if (this.isMoving) {
            this.isMoving = false;

            if (stopVelocity) {
                this.velocity.set(0);
            }

            //  Send the Sprite this Body belongs to
            //  and a boolean indicating if it stopped because of a collision or not
            this.onMoveComplete.dispatch(this, (this.overlapX !== 0 || this.overlapY !== 0));
        }

    }

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#postUpdate
    * @protected
    */
    postUpdate() {

        //  Only allow postUpdate to be called once per frame
        if (!this.enable || !this.dirty) {
            return;
        }

        //  Moving?
        if (this.isMoving) {
            this.updateMovement();
        }

        this.dirty = false;

        if (this.deltaX() < 0) {
            this.facing = Facing.LEFT;
        }
        else if (this.deltaX() > 0) {
            this.facing = Facing.RIGHT;
        }

        if (this.deltaY() < 0) {
            this.facing = Facing.UP;
        }
        else if (this.deltaY() > 0) {
            this.facing = Facing.DOWN;
        }

        if (this.moves) {
            this._dx = this.deltaX();
            this._dy = this.deltaY();

            if (this.deltaMax.x !== 0 && this._dx !== 0) {
                if (this._dx < 0 && this._dx < -this.deltaMax.x) {
                    this._dx = -this.deltaMax.x;
                }
                else if (this._dx > 0 && this._dx > this.deltaMax.x) {
                    this._dx = this.deltaMax.x;
                }
            }

            if (this.deltaMax.y !== 0 && this._dy !== 0) {
                if (this._dy < 0 && this._dy < -this.deltaMax.y) {
                    this._dy = -this.deltaMax.y;
                }
                else if (this._dy > 0 && this._dy > this.deltaMax.y) {
                    this._dy = this.deltaMax.y;
                }
            }

            this.position.x += this._dx;
            this.position.y += this._dy;
            this._reset = true;
        }

        this.updateCenter();

        this.prev.x = this.position.x;
        this.prev.y = this.position.y;

    }

    /**
    * Internal method.
    *
    * @method Phaser.Physics.Arcade.Body#checkWorldBounds
    * @protected
    * @return {boolean} True if the Body collided with the world bounds, otherwise false.
    */
    checkWorldBounds(): boolean {

        let pos = this.position;
        let bounds = this.game.physics.arcade.bounds;
        let check = this.game.physics.arcade.checkCollision;

        let bx = (this.worldBounce) ? -this.worldBounce.x : -this.bounce.x;
        let by = (this.worldBounce) ? -this.worldBounce.y : -this.bounce.y;

        if (pos.x < bounds.x && check.left) {
            pos.x = bounds.x;
            this.velocity.x *= bx;
            this.blocked.left = true;
            this.blocked.none = false;
        } else if (this.right > bounds.right && check.right) {
            pos.x = bounds.right - this.width;
            this.velocity.x *= bx;
            this.blocked.right = true;
            this.blocked.none = false;
        }

        if (pos.y < bounds.y && check.up) {
            pos.y = bounds.y;
            this.velocity.y *= by;
            this.blocked.up = true;
            this.blocked.none = false;
        } else if (this.bottom > bounds.bottom && check.down) {
            pos.y = bounds.bottom - this.height;
            this.velocity.y *= by;
            this.blocked.down = true;
            this.blocked.none = false;
        }

        return !this.blocked.none;

    }

    /**
    * Note: This method is experimental, and may be changed or removed in a future release.
    *
    * This method moves the Body in the given direction, for the duration specified.
    * It works by setting the velocity on the Body, and an internal timer, and then
    * monitoring the duration each frame. When the duration is up the movement is
    * stopped and the `Body.onMoveComplete` signal is dispatched.
    *
    * Movement also stops if the Body collides or overlaps with any other Body.
    *
    * You can control if the velocity should be reset to zero on collision, by using
    * the property `Body.stopVelocityOnCollide`.
    *
    * Stop the movement at any time by calling `Body.stopMovement`.
    *
    * You can optionally set a speed in pixels per second. If not specified it
    * will use the current `Body.speed` value. If this is zero, the function will return false.
    *
    * Please note that due to browser timings you should allow for a variance in
    * when the duration will actually expire. Depending on system it may be as much as
    * +- 50ms. Also this method doesn't take into consideration any other forces acting
    * on the Body, such as Gravity, drag or maxVelocity, all of which may impact the
    * movement.
    *
    * @method Phaser.Physics.Arcade.Body#moveFrom
    * @param  {integer} duration  - The duration of the movement, in ms.
    * @param  {integer} [speed] - The speed of the movement, in pixels per second. If not provided `Body.speed` is used.
    * @param  {integer} [direction] - The angle of movement. If not provided `Body.angle` is used.
    * @return {boolean} True if the movement successfully started, otherwise false.
    */
    moveFrom(duration: number, speed?: number, direction?: number): boolean {

        if (speed === undefined) { speed = this.speed; }

        if (speed === 0) {
            return false;
        }

        let angle;

        if (direction === undefined) {
            angle = this.angle;
            direction = MMaths.radToDeg(angle);
        } else {
            angle = MMaths.degToRad(direction);
        }

        this.moveTimer = 0;
        this.moveDuration = duration;

        //  Avoid sin/cos
        if (direction === 0 || direction === 180) {
            this.velocity.set(Math.cos(angle) * speed, 0);
        } else if (direction === 90 || direction === 270) {
            this.velocity.set(0, Math.sin(angle) * speed);
        } else {
            this.velocity.setToPolar(angle, speed);
        }

        this.isMoving = true;

        return true;

    }

    /**
    * Note: This method is experimental, and may be changed or removed in a future release.
    *
    * This method moves the Body in the given direction, for the duration specified.
    * It works by setting the velocity on the Body, and an internal distance counter.
    * The distance is monitored each frame. When the distance equals the distance
    * specified in this call, the movement is stopped, and the `Body.onMoveComplete`
    * signal is dispatched.
    *
    * Movement also stops if the Body collides or overlaps with any other Body.
    *
    * You can control if the velocity should be reset to zero on collision, by using
    * the property `Body.stopVelocityOnCollide`.
    *
    * Stop the movement at any time by calling `Body.stopMovement`.
    *
    * Please note that due to browser timings you should allow for a variance in
    * when the distance will actually expire.
    *
    * Note: This method doesn't take into consideration any other forces acting
    * on the Body, such as Gravity, drag or maxVelocity, all of which may impact the
    * movement.
    *
    * @method Phaser.Physics.Arcade.Body#moveTo
    * @param  {integer} duration - The duration of the movement, in ms.
    * @param  {integer} distance - The distance, in pixels, the Body will move.
    * @param  {integer} [direction] - The angle of movement. If not provided `Body.angle` is used.
    * @return {boolean} True if the movement successfully started, otherwise false.
    */
    moveTo(duration: number, distance: number, direction?: number): boolean {

        let speed = distance / (duration / 1000);

        if (speed === 0) {
            return false;
        }

        let angle;

        if (direction === undefined) {
            angle = this.angle;
            direction = MMaths.radToDeg(angle);
        } else {
            angle = MMaths.degToRad(direction);
        }

        distance = Math.abs(distance);

        this.moveDuration = 0;
        this.moveDistance = distance;

        if (this.moveTarget === null) {
            this.moveTarget = new Line();
            this.moveEnd = new Point();
        }

        this.moveTarget.fromAngle(this.x, this.y, angle, distance);

        this.moveEnd.set(this.moveTarget.end.x, this.moveTarget.end.y);

        this.moveTarget.setTo(this.x, this.y, this.x, this.y);

        //  Avoid sin/cos
        if (direction === 0 || direction === 180) {
            this.velocity.set(Math.cos(angle) * speed, 0);
        } else if (direction === 90 || direction === 270) {
            this.velocity.set(0, Math.sin(angle) * speed);
        } else {
            this.velocity.setToPolar(angle, speed);
        }

        this.isMoving = true;

        return true;

    }

    /**
    * You can modify the size of the physics Body to be any dimension you need.
    * This allows you to make it smaller, or larger, than the parent Sprite. You
    * can also control the x and y offset of the Body.
    *
    * The width, height, and offset arguments are relative to the Sprite
    * _texture_ and are scaled with the Sprite's {@link Phaser.Sprite#scale}
    * (but **not** the scale of any ancestors or the {@link Phaser.Camera#scale
    * Camera scale}).
    *
    * For example: If you have a Sprite with a texture that is 80x100 in size,
    * and you want the physics body to be 32x32 pixels in the middle of the
    * texture, you would do:
    *
    * `setSize(32 / Math.abs(this.scale.x), 32 / Math.abs(this.scale.y), 24,
    * 34)`
    *
    * Where the first two parameters are the new Body size (32x32 pixels)
    * relative to the Sprite's scale. 24 is the horizontal offset of the Body
    * from the top-left of the Sprites texture, and 34 is the vertical offset.
    *
    * If you've scaled a Sprite by altering its `width`, `height`, or `scale`
    * and you want to position the Body relative to the Sprite's dimensions
    * (which will differ from its texture's dimensions), you should divide these
    * arguments by the Sprite's current scale:
    *
    * `setSize(32 / sprite.scale.x, 32 / sprite.scale.y)`
    *
    * Calling `setSize` on a Body that has already had `setCircle` will reset
    * all of the Circle properties, making this Body rectangular again.
    * @method Phaser.Physics.Arcade.Body#setSize
    * @param {number} width - The width of the Body, relative to the Sprite's
    * texture.
    * @param {number} height - The height of the Body, relative to the Sprite's
    * texture.
    * @param {number} [offsetX] - The X offset of the Body from the left of the
    * Sprite's texture.
    * @param {number} [offsetY] - The Y offset of the Body from the top of the
    * Sprite's texture.
    */
    setSize(width: number, height: number) {

        this.sourceWidth = width;
        this.sourceHeight = height;
        this.width = this.sourceWidth * this._sx;
        this.height = this.sourceHeight * this._sy;
        this.updateCenter();
    }

    /**
    * Resets all Body values (velocity, acceleration, rotation, etc)
    *
    * @method Phaser.Physics.Arcade.Body#reset
    * @param {number} x - The new x position of the Body.
    * @param {number} y - The new y position of the Body.
    */
    reset(x: number, y: number) {

        this.stop();

        this.prev.x = this.position.x;
        this.prev.y = this.position.y;

        this.updateCenter();

    }

    /**
     * Sets acceleration, velocity, and {@link #speed} to 0.
     *
     * @method Phaser.Physics.Arcade.Body#stop
     */
    stop() {

        this.velocity.set(0);
        this.acceleration.set(0);
        this.speed = 0;

    }

    /**
    * Returns the bounds of this physics body.
    *
    * Only used internally by the World collision methods.
    *
    * @method Phaser.Physics.Arcade.Body#getBounds
    * @param {object} obj - The object in which to set the bounds values.
    * @return {object} The object that was given to this method.
    */
    getBounds(obj: any): object {

        obj.x = this.x;
        obj.y = this.y;
        obj.right = this.right;
        obj.bottom = this.bottom;

        return obj;

    }

    /**
    * Tests if a world point lies within this Body.
    *
    * @method Phaser.Physics.Arcade.Body#hitTest
    * @param {number} x - The world x coordinate to test.
    * @param {number} y - The world y coordinate to test.
    * @return {boolean} True if the given coordinates are inside this Body, otherwise false.
    */
    hitTest(x: number, y: number): boolean {

        return Rectangle.contains(this, x, y);

    }

    /**
    * Returns true if the bottom of this Body is in contact with either the world bounds or a tile.
    *
    * @method Phaser.Physics.Arcade.Body#onFloor
    * @return {boolean} True if in contact with either the world bounds or a tile.
    */
    onFloor(): boolean {

        return this.blocked.down;

    }

    /**
    * Returns true if the top of this Body is in contact with either the world bounds or a tile.
    *
    * @method Phaser.Physics.Arcade.Body#onCeiling
    * @return {boolean} True if in contact with either the world bounds or a tile.
    */
    onCeiling(): boolean {

        return this.blocked.up;

    }

    /**
    * Returns true if either side of this Body is in contact with either the world bounds or a tile.
    *
    * @method Phaser.Physics.Arcade.Body#onWall
    * @return {boolean} True if in contact with either the world bounds or a tile.
    */
    onWall(): boolean {

        return (this.blocked.left || this.blocked.right);

    }

    /**
    * Returns the absolute delta x value.
    *
    * @method Phaser.Physics.Arcade.Body#deltaAbsX
    * @return {number} The absolute delta value.
    */
    deltaAbsX(): number {

        return (this.deltaX() > 0 ? this.deltaX() : -this.deltaX());

    }

    /**
    * Returns the absolute delta y value.
    *
    * @method Phaser.Physics.Arcade.Body#deltaAbsY
    * @return {number} The absolute delta value.
    */
    deltaAbsY(): number {

        return (this.deltaY() > 0 ? this.deltaY() : -this.deltaY());

    }

    /**
    * Returns the delta x value. The difference between Body.x now and in the previous step.
    *
    * @method Phaser.Physics.Arcade.Body#deltaX
    * @return {number} The delta value. Positive if the motion was to the right, negative if to the left.
    */
    deltaX(): number {

        return this.position.x - this.prev.x;

    }

    /**
    * Returns the delta y value. The difference between Body.y now and in the previous step.
    *
    * @method Phaser.Physics.Arcade.Body#deltaY
    * @return {number} The delta value. Positive if the motion was downwards, negative if upwards.
    */
    deltaY(): number {

        return this.position.y - this.prev.y;

    }




    /**
    * @name Phaser.Physics.Arcade.Body#left
    * @property {number} left - The x position of the Body. The same as `Body.x`.
    */
    get left(): number {
        return this.position.x;
    }

    /**
    * @name Phaser.Physics.Arcade.Body#right
    * @property {number} right - The right value of this Body (same as Body.x + Body.width)
    * @readonly
    */
    get right(): number {
        return this.position.x + this.width;
    }

    /**
    * @name Phaser.Physics.Arcade.Body#top
    * @property {number} top - The y position of the Body. The same as `Body.y`.
    */
    get top(): number {
        return this.position.y;
    }

    /**
    * @name Phaser.Physics.Arcade.Body#bottom
    * @property {number} bottom - The bottom value of this Body (same as Body.y + Body.height)
    * @readonly
    */
    get bottom(): number {
        return this.position.y + this.height;
    }

    /**
    * @name Phaser.Physics.Arcade.Body#x
    * @property {number} x - The x position.
    */
    get x(): number {
        return this.position.x;
    }

    set x(value: number) {
        this.position.x = value;
    }

    /**
    * @name Phaser.Physics.Arcade.Body#y
    * @property {number} y - The y position.
    */
    get y(): number {
        return this.position.y;
    }

    set y(value: number) {
        this.position.y = value;
    }
}