import { DisplayObject } from "./DisplayObject";
import { Rectangle, EmptyRectangle } from "../geom/Rectangle";
import { identityMatrix } from "../geom/Matrix";
import { Stage } from "./Stage";

/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * A DisplayObjectContainer represents a collection of display objects.
 * It is the base class of all display objects that act as a container for other objects.
 *
 * @class DisplayObjectContainer
 * @extends DisplayObject
 * @constructor
 */
export class DisplayObjectContainer extends DisplayObject {

    constructor() {
        super();
    }

    public children: DisplayObject[] = [];


    /**
     * The width of the displayObjectContainer, setting this will actually modify the scale to achieve the value set
     *
     * @property width
     * @type Number
     */
    get width(): number {
        return this.scale.x * this.getLocalBounds().width;
    }

    set width(value: number) {
        let width = this.getLocalBounds().width;

        if (width !== 0) {
            this.scale.x = value / width;
        }
        else {
            this.scale.x = 1;
        }
    }


    /**
     * The height of the displayObjectContainer, setting this will actually modify the scale to achieve the value set
     *
     * @property height
     * @type Number
     */
    get height(): number {
        return  this.scale.y * this.getLocalBounds().height;
    }

    set height(value: number) {
        let height = this.getLocalBounds().height;

        if (height !== 0) {
            this.scale.y = value / height;
        }
        else {
            this.scale.y = 1;
        }

    }

    /**
     * Adds a child to the container.
     *
     * @method addChild
     * @param child {DisplayObject} The DisplayObject to add to the container
     * @return {DisplayObject} The child that was added.
     */
    addChild(child: DisplayObject): DisplayObject {
        return this.addChildAt(child, this.children.length);
    }

    /**
     * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
     *
     * @method addChildAt
     * @param child {DisplayObject} The child to add
     * @param index {Number} The index to place the child in
     * @return {DisplayObject} The child that was added.
     */
    addChildAt(child: DisplayObject, index: number): DisplayObject {
        if (index >= 0 && index <= this.children.length) {
            if (child.parent) {
                child.parent.removeChild(child);
            }

            child.parent = this;

            this.children.splice(index, 0, child);

            if (this.stage)child.setStageReference(this.stage);

            return child;
        }
        else {
            throw new Error(child + 'addChildAt: The index ' + index + ' supplied is out of bounds ' + this.children.length);
        }
    }

    /**
     * Swaps the position of 2 Display Objects within this container.
     *
     * @method swapChildren
     * @param child {DisplayObject}
     * @param child2 {DisplayObject}
     */
    swapChildren(child: DisplayObject, child2: DisplayObject) {
        if (child === child2) {
            return;
        }

        let index1 = this.getChildIndex(child);
        let index2 = this.getChildIndex(child2);

        if (index1 < 0 || index2 < 0) {
            throw new Error('swapChildren: Both the supplied DisplayObjects must be a child of the caller.');
        }

        this.children[index1] = child2;
        this.children[index2] = child;

    }

    /**
     * Returns the index position of a child DisplayObject instance
     *
     * @method getChildIndex
     * @param child {DisplayObject} The DisplayObject instance to identify
     * @return {Number} The index position of the child display object to identify
     */
    getChildIndex(child: DisplayObject): number {
        let index = this.children.indexOf(child);
        if (index === -1) {
            throw new Error('The supplied DisplayObject must be a child of the caller');
        }
        return index;
    }

    /**
     * Changes the position of an existing child in the display object container
     *
     * @method setChildIndex
     * @param child {DisplayObject} The child DisplayObject instance for which you want to change the index number
     * @param index {Number} The resulting index number for the child display object
     */
    setChildIndex(child: DisplayObject, index: number) {
        if (index < 0 || index >= this.children.length) {
            throw new Error('The supplied index is out of bounds');
        }

        let currentIndex = this.getChildIndex(child);
        this.children.splice(currentIndex, 1); // remove from old position
        this.children.splice(index, 0, child); // add at new position
    }

    /**
     * Returns the child at the specified index
     *
     * @method getChildAt
     * @param index {Number} The index to get the child from
     * @return {DisplayObject} The child at the given index, if any.
     */
    getChildAt(index: number): DisplayObject {
        if (index < 0 || index >= this.children.length) {
            throw new Error('getChildAt: Supplied index ' + index + ' does not exist in the child list, or the supplied DisplayObject must be a child of the caller');
        }
        return this.children[index];

    }

    /**
     * Removes a child from the container.
     *
     * @method removeChild
     * @param child {DisplayObject} The DisplayObject to remove
     * @return {DisplayObject} The child that was removed.
     */
    removeChild(child: DisplayObject): DisplayObject {
        let index = this.children.indexOf( child );
        if (index === -1)return;

        return this.removeChildAt( index );
    }

    /**
     * Removes a child from the specified index position.
     *
     * @method removeChildAt
     * @param index {Number} The index to get the child from
     * @return {DisplayObject} The child that was removed.
     */
    removeChildAt(index: number): DisplayObject {
        let child = this.getChildAt( index );
        if (this.stage) child.removeStageReference();

        child.parent = undefined;
        this.children.splice( index, 1 );
        return child;
    }

    /**
    * Removes all children from this container that are within the begin and end indexes.
    *
    * @method removeChildren
    * @param beginIndex {Number} The beginning position. Default value is 0.
    * @param endIndex {Number} The ending position. Default value is size of the container.
    */
    removeChildren(begin: number = 0, end: number = this.children.length) {
        let range = end - begin;

        if (range > 0 && range <= end) {
            let removed = this.children.splice(begin, range);
            for (let i = 0; i < removed.length; i++) {
                let child = removed[i];
                if (this.stage)
                    child.removeStageReference();
                child.parent = undefined;
            }
            return removed;
        } else if (range === 0 && this.children.length === 0) {
            return [];
        } else {
            throw new Error( 'removeChildren: Range Error, numeric values are outside the acceptable range' );
        }
    }

    /*
    * Updates the transform on all children of this container for rendering
    *
    * @method updateTransform
    * @private
    */
    private updateTransform() {

        this.displayObjectUpdateTransform();

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].updateTransform();
        }
    }



    // performance increase to avoid using call.. (10x faster)
    displayObjectContainerUpdateTransform() {
        this.updateTransform();
    }

    /**
     * Retrieves the bounds of the displayObjectContainer as a rectangle. The bounds calculation takes all visible children into consideration.
     *
     * @method getBounds
     * @return {Rectangle} The rectangular bounding area
     */
    getBounds(): Rectangle {
        if (this.children.length === 0)return EmptyRectangle;

        // TODO the bounds have already been calculated this render session so return what we have

        let minX = Infinity;
        let minY = Infinity;

        let maxX = -Infinity;
        let maxY = -Infinity;

        let childBounds;
        let childMaxX;
        let childMaxY;

        for (let i = 0, j = this.children.length; i < j; i++) {
            childBounds = this.children[i].getBounds();

            minX = minX < childBounds.x ? minX : childBounds.x;
            minY = minY < childBounds.y ? minY : childBounds.y;

            childMaxX = childBounds.width + childBounds.x;
            childMaxY = childBounds.height + childBounds.y;

            maxX = maxX > childMaxX ? maxX : childMaxX;
            maxY = maxY > childMaxY ? maxY : childMaxY;
        }

        let bounds = new Rectangle();

        bounds.x = minX;
        bounds.y = minY;
        bounds.width = maxX - minX;
        bounds.height = maxY - minY;

        // TODO: store a reference so that if this function gets called again in the render cycle we do not have to recalculate
        // this._currentBounds = bounds;
        return bounds;
    }

    /**
     * Retrieves the non-global local bounds of the displayObjectContainer as a rectangle. The calculation takes all visible children into consideration.
     *
     * @method getLocalBounds
     * @return {Rectangle} The rectangular bounding area
     */
    getLocalBounds(): Rectangle {

        let matrixCache = this.worldTransform;

        this.worldTransform = identityMatrix;

        for (let i = 0, j = this.children.length; i < j; i++) {
            this.children[i].updateTransform();
        }

        let bounds = this.getBounds();

        this.worldTransform = matrixCache;

        return bounds;
    }

    /**
     * Sets the containers Stage reference. This is the Stage that this object, and all of its children, is connected to.
     *
     * @method setStageReference
     * @param stage {Stage} the stage that the container will have as its current stage reference
     */
    setStageReference(stage: Stage) {
        this.stage = stage;

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].setStageReference(stage);
        }
    }

    /**
     * Removes the current stage reference from the container and all of its children.
     *
     * @method removeStageReference
     */
    removeStageReference() {
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].removeStageReference();
        }

        this.stage = null;
    }

    destroy() {
        super.destroy();
        let i = this.children.length;

        while (i--) {
            this.children[i].destroy();
        }

        this.children = [];
    }
}