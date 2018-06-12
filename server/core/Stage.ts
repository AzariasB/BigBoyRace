import { DisplayObjectContainer } from './DisplayObjectContainer';
import { Game } from './Game';
import { Matrix } from '../geom/Matrix';
import { DisplayObject } from './DisplayObject';

/**
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2016 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Stage controls root level display objects upon which everything is displayed.
* It also handles browser visibility handling and the pausing due to loss of focus.
*
* @class Phaser.Stage
* @extends PIXI.DisplayObjectContainer
* @constructor
* @param {Phaser.Game} game - Game reference to the currently running game.
 */
export class Stage extends DisplayObjectContainer {

    constructor(public game: Game) {
        super();
    }

    /**
    * @property {string} name - The name of this object.
    * @default
    */
    public name: string = '_stage_root';


    /**
    * @property {boolean} exists - If exists is true the Stage and all children are updated, otherwise it is skipped.
    * @default
    */
    public exists: boolean = true;

    /**
    * @property {Phaser.Matrix} worldTransform - Current transform of the object based on world (parent) factors
    * @private
    * @readOnly
    */
    public worldTransform: Matrix = new Matrix();

    /**
    * @property {Phaser.Stage} stage - The stage reference (the Stage is its own stage)
    * @private
    * @readOnly
    */
    public stage: Stage = this;

    /**
    * @property {number} currentRenderOrderID - Reset each frame, keeps a count of the total number of objects updated.
    */
    public currentRenderOrderID: number = 0;

    /**
    * @property {string} hiddenVar - The page visibility API event name.
    * @private
    */
    public _hiddenVar: string = 'hidden';


    /**
    * This is called automatically after the plugins preUpdate and before the State.update.
    * Most objects have preUpdate methods and it's where initial movement and positioning is done.
    *
    * @method Phaser.Stage#preUpdate
    */
    preUpdate() {

        this.currentRenderOrderID = 0;

        //  This can't loop in reverse, we need the renderOrderID to be in sequence
        let i = 0;

        while (i < this.children.length) {
            let  child: any = this.children[i];

            child.preUpdate();

            if (this === child.parent) {
                i++;
            }
        }

    }

    /**
    * This is called automatically after the State.update, but before particles or plugins update.
    *
    * @method Phaser.Stage#update
    */
    update() {

        //  Goes in reverse, because it's highly likely the child will destroy itself in `update`
        let  i = this.children.length;

        while (i--) {
            this.children[i].update();
        }

    }

    /**
    * This is called automatically before the renderer runs and after the plugins have updated.
    * In postUpdate this is where all the final physics calculations and object positioning happens.
    * The objects are processed in the order of the display list.
    *
    * @method Phaser.Stage#postUpdate
    */
    postUpdate() {

        this.updateTransform();

    }

    /**
    * Updates the transforms for all objects on the display list.
    * This overrides the Pixi default as we don't need the interactionManager, but do need the game property check.
    *
    * @method Phaser.Stage#updateTransform
    */
    updateTransform() {

        for (let i = 0; i < this.children.length; i++) {
            this.children[i].updateTransform();
        }

    }

    /**
    * Adds an existing object to the Stage.
    *
    * The child is automatically added to the front of the Stage, and is displayed above every previous child.
    * Or if the _optional_ `index` is specified, the child is added at the location specified by the index value,
    * this allows you to control child ordering.
    *
    * If the object was already on the Stage, it is simply returned, and nothing else happens to it.
    *
    * @method Phaser.Stage#add
    * @param {DisplayObject} child - The display object to add as a child.
    * @param {boolean} [silent] - Unused. Kept for compatibility with {@link Phaser.Group#add}.
    * @param {integer} [index] - The index to insert the object to.
    * @return {DisplayObject} The child that was added to the group.
    */
    add(child: any, silent?: boolean, index?: number): DisplayObject {

        if (child.parent === this) {
            return child;
        }

        if (child.body && child.parent && child.parent.hash) {
            child.parent.removeFromHash(child);
        }

        if (index === undefined) {
            this.addChild(child);
        }
        else {
            this.addChildAt(child, index);
        }

        return child;

    }
}