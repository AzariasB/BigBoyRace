import { Point } from '../geom/Point';
import { Rectangle, EmptyRectangle } from '../geom/Rectangle';
import { Stage } from './Stage';
import { Matrix, identityMatrix } from '../geom/Matrix';
import { Game } from './Game';
import { MMaths } from '../physics/Math';
import { DisplayObjectContainer } from './DisplayObjectContainer';

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The base class for all objects that are rendered on the screen.
 * This is an abstract class and should not be used on its own rather it should be extended.
 *
 * @class DisplayObject
 * @constructor
 */
export class DisplayObject {

    constructor() {}
    /**
     * The coordinate of the object relative to the local coordinates of the parent.
     *
     * @property position
     * @type Point
     */
    public position: Point = new Point(0, 0);

    public game: Game;

    /**
     * The scale factor of the object.
     *
     * @property scale
     * @type Point
     */
    public scale: Point = new Point(1, 1);

    /**
     * The pivot point of the displayObject that it rotates around
     *
     * @property pivot
     * @type Point
     */
    public pivot: Point = new Point(0, 0);

    /**
     * The rotation of the object in radians.
     *
     * @property rotation
     * @type Number
     */
    public rotation: number = 0;

    private rotationCache: number = null;

    /**
     * This is the defined area that will pick up mouse / touch events. It is null by default.
     * Setting it is a neat way of optimising the hitTest function that the interactionManager will use (as it will not need to hit test all the children)
     *
     * @property hitArea
     * @type Rectangle|Circle|Ellipse|Polygon
     */
    public hitArea: Rectangle = null;

    /**
     * [read-only] The display object container that contains this display object.
     *
     * @property parent
     * @type DisplayObjectContainer
     * @readOnly
     */
    public parent: DisplayObjectContainer = null;

    /**
     * [read-only] The stage the display object is connected to, or undefined if it is not connected to the stage.
     *
     * @property stage
     * @type Stage
     * @readOnly
     */
    public stage: Stage = null;

    /**
     * [read-only] Current transform of the object based on world (parent) factors
     *
     * @property worldTransform
     * @type Matrix
     * @readOnly
     * @private
     */
    protected worldTransform: Matrix = new Matrix();

    /**
     * The position of the Display Object based on the world transform.
     * This value is updated at the end of updateTransform and takes all parent transforms into account.
     *
     * @property worldPosition
     * @type Point
     * @readOnly
     */
    public readonly worldPosition: Point = new Point(0, 0);

    /**
     * The scale of the Display Object based on the world transform.
     * This value is updated at the end of updateTransform and takes all parent transforms into account.
     *
     * @property worldScale
     * @type Point
     * @readOnly
     */
    public readonly worldScale: Point = new Point(1, 1);

    /**
     * The rotation of the Display Object, in radians, based on the world transform.
     * This value is updated at the end of updateTransform and takes all parent transforms into account.
     *
     * @property worldRotation
     * @type Number
     * @readOnly
     */
    public worldRotation: number = 0;

    /**
     * cached sin rotation and cos rotation
     *
     * @property _sr
     * @type Number
     * @private
     */
    private _sr: number = 0;

    /**
     * cached sin rotation and cos rotation
     *
     * @property _cr
     * @type Number
     * @private
     */
    private _cr: number = 1;


    /**
     * Destroy this DisplayObject.
     * Removes all references to transformCallbacks, its parent, the stage, filters, bounds, mask and cached Sprites.
     *
     * @method destroy
     */
    destroy() {
        this.hitArea = null;
        this.parent = null;
        this.stage = null;
        this.worldTransform = null;

    }

    update() {}

    /*
    * Updates the object transform for rendering.
    *
    * If the object has no parent, and no parent parameter is provided, it will default to Phaser.Game.World as the parent.
    * If that is unavailable the transform fails to take place.
    *
    * The `parent` parameter has priority over the actual parent. Use it as a parent override.
    * Setting it does **not** change the actual parent of this DisplayObject, it just uses the parent for the transform update.
    *
    * @method updateTransform
    * @param {DisplayObject} [parent] - Optional parent to parent this DisplayObject transform from.
    */
    protected updateTransform (parent?: DisplayObject) {
        if (!parent && !this.parent && !this.game) {
            return;
        }

        let p = parent || this.game.world || this.parent;

        // create some matrix refs for easy access
        let pt = p.worldTransform;
        let wt = this.worldTransform;

        // temporary matrix variables
        let a, b, c, d, tx, ty;

        // so if rotation is between 0 then we can simplify the multiplication process..
        if (this.rotation % MMaths.PI_2) {
            // check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
            if (this.rotation !== this.rotationCache) {
                this.rotationCache = this.rotation;
                this._sr = Math.sin(this.rotation);
                this._cr = Math.cos(this.rotation);
            }

            // get the matrix values of the displayobject based on its transform properties..
            a  =  this._cr * this.scale.x;
            b  =  this._sr * this.scale.x;
            c  = -this._sr * this.scale.y;
            d  =  this._cr * this.scale.y;
            tx =  this.position.x;
            ty =  this.position.y;

            // check for pivot.. not often used so geared towards that fact!
            if (this.pivot.x || this.pivot.y) {
                tx -= this.pivot.x * a + this.pivot.y * c;
                ty -= this.pivot.x * b + this.pivot.y * d;
            }

            // concat the parent matrix with the objects transform.
            wt.a  = a  * pt.a + b  * pt.c;
            wt.b  = a  * pt.b + b  * pt.d;
            wt.c  = c  * pt.a + d  * pt.c;
            wt.d  = c  * pt.b + d  * pt.d;
            wt.tx = tx * pt.a + ty * pt.c + pt.tx;
            wt.ty = tx * pt.b + ty * pt.d + pt.ty;
        } else {
            // lets do the fast version as we know there is no rotation..
            a  = this.scale.x;
            d  = this.scale.y;

            tx = this.position.x - this.pivot.x * a;
            ty = this.position.y - this.pivot.y * d;

            wt.a  = a  * pt.a;
            wt.b  = a  * pt.b;
            wt.c  = d  * pt.c;
            wt.d  = d  * pt.d;
            wt.tx = tx * pt.a + ty * pt.c + pt.tx;
            wt.ty = tx * pt.b + ty * pt.d + pt.ty;
        }

        // multiply the alphas..

        this.worldPosition.set(wt.tx, wt.ty);
        this.worldScale.set(Math.sqrt(wt.a * wt.a + wt.b * wt.b), Math.sqrt(wt.c * wt.c + wt.d * wt.d));
        this.worldRotation = Math.atan2(-wt.c, wt.d);


    }

    displayObjectUpdateTransform(...args: any[]) {
        this.updateTransform.apply(this, args);
    }

    /**
     * Retrieves the bounds of the displayObject as a rectangle object
     *
     * @method getBounds
     * @param matrix {Matrix}
     * @return {Rectangle} the rectangular bounding area
     */
    getBounds(matrix?: Matrix): Rectangle {
        matrix = matrix; // just to get passed js hinting (and preserve inheritance)
        return EmptyRectangle;
    }

    /**
     * Retrieves the local bounds of the displayObject as a rectangle object
     *
     * @method getLocalBounds
     * @return {Rectangle} the rectangular bounding area
     */
    getLocalBounds(): Rectangle {
        return this.getBounds(identityMatrix); // /PIXI.EmptyRectangle();
    }

    /**
     * Sets the object's stage reference, the stage this object is connected to
     *
     * @method setStageReference
     * @param stage {Stage} the stage that the object will have as its current stage reference
     */
    setStageReference(stage: Stage) {
        this.stage = stage;
    }

    /**
     * Empty, to be overridden by classes that require it.
     *
     * @method preUpdate
     */
    preUpdate() {}

    removeStageReference() {}

    /**
     * Calculates the global position of the display object
     *
     * @method toGlobal
     * @param position {Point} The world origin to calculate from
     * @return {Point} A point object representing the position of this object
     */
    toGlobal(position: Point): Point {
        // don't need to u[date the lot
        this.displayObjectUpdateTransform();
        return this.worldTransform.apply(position);
    }

    /**
     * Calculates the local position of the display object relative to another point
     *
     * @method toLocal
     * @param position {Point} The world origin to calculate from
     * @param [from] {DisplayObject} The DisplayObject to calculate the global position from
     * @return {Point} A point object representing the position of this object
     */
    toLocal(position: Point, from: DisplayObject): Point {
        if (from) {
            position = from.toGlobal(position);
        }

        // don't need to u[date the lot
        this.displayObjectUpdateTransform();

        return this.worldTransform.applyInverse(position);
    }

    get x(): number {
        return this.position.x;
    }

    set x(value: number) {
        this.position.x = value;
    }

    /**
     * The position of the displayObject on the y axis relative to the local coordinates of the parent.
     *
     * @property y
     * @type Number
     */
    get y(): number {
        return this.position.y;
    }

    set y(value: number) {
        this.position.y = value;
    }

}