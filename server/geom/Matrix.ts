import { Point } from "./Point";

/**
* @author       Mat Groves http://matgroves.com/ @Doormat23
* @author       Richard Davey <rich@photonstorm.com>
* @copyright    2015 Photon Storm Ltd.
* @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
*/

/**
* The Matrix is a 3x3 matrix mostly used for display transforms within the renderer.
* 
* It is represented like so:
* 
* | a | b | tx |
* | c | d | ty |
* | 0 | 0 | 1 |
*
* @class Phaser.Matrix
* @constructor
* @param {number} [a=1]
* @param {number} [b=0]
* @param {number} [c=0]
* @param {number} [d=1]
* @param {number} [tx=0]
* @param {number} [ty=0]
*/
export class Matrix {

    constructor(
        public a: number = 1,
        public b: number = 0,
        public c: number = 0,
        public d: number = 1,
        public tx: number = 0,
        public ty: number = 0
    ) {}

    /**
    * Sets the values of this Matrix to the values in the given array.
    * 
    * The Array elements should be set as follows:
    *
    * a = array[0]
    * b = array[1]
    * c = array[3]
    * d = array[4]
    * tx = array[2]
    * ty = array[5]
    *
    * @method Phaser.Matrix#fromArray
    * @param {Array} array - The array to copy from.
    * @return {Phaser.Matrix} This Matrix object.
    */
    fromArray(array: number[]): Matrix {

        return this.setTo(array[0], array[1], array[3], array[4], array[2], array[5]);

    }

    /**
    * Sets the values of this Matrix to the given values.
    *
    * @method Phaser.Matrix#setTo
    * @param {number} a
    * @param {number} b
    * @param {number} c
    * @param {number} d
    * @param {number} tx
    * @param {number} ty
    * @return {Phaser.Matrix} This Matrix object.
    */
    setTo(a: number, b: number, c: number, d: number, tx: number, ty: number): Matrix {

        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.tx = tx;
        this.ty = ty;

        return this;

    }

    /**
     * Creates a new Matrix object based on the values of this Matrix.
     * If you provide the output parameter the values of this Matrix will be copied over to it.
     * If the output parameter is blank a new Matrix object will be created.
     *
     * @method Phaser.Matrix#clone
     * @param {Phaser.Matrix} [output] - If provided the values of this Matrix will be copied to it, otherwise a new Matrix object is created.
     * @return {Phaser.Matrix} A clone of this Matrix.
     */
    clone(output: Matrix = new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty)): Matrix {

        output.a = this.a;
        output.b = this.b;
        output.c = this.c;
        output.d = this.d;
        output.tx = this.tx;
        output.ty = this.ty;

        return output;

    }

    /**
    * Copies the properties from this Matrix to the given Matrix.
    *
    * @method Phaser.Matrix#copyTo
    * @param {Phaser.Matrix} matrix - The Matrix to copy from.
    * @return {Phaser.Matrix} The destination Matrix object.
    */
    copyTo(matrix: Matrix): Matrix {

        matrix.copyFrom(this);

        return matrix;

    }

    /**
    * Copies the properties from the given Matrix into this Matrix.
    *
    * @method Phaser.Matrix#copyFrom
    * @param {Phaser.Matrix} matrix - The Matrix to copy from.
    * @return {Phaser.Matrix} This Matrix object.
    */
    copyFrom(matrix: Matrix): Matrix {

        this.a = matrix.a;
        this.b = matrix.b;
        this.c = matrix.c;
        this.d = matrix.d;
        this.tx = matrix.tx;
        this.ty = matrix.ty;

        return this;

    }

    /**
    * Creates a Float32 Array with values populated from this Matrix object.
    *
    * @method Phaser.Matrix#toArray
    * @param {boolean} [transpose=false] - Whether the values in the array are transposed or not.
    * @param {PIXI.Float32Array} [array] - If provided the values will be set into this array, otherwise a new Float32Array is created.
    * @return {PIXI.Float32Array} The newly created array which contains the matrix.
    */
    toArray(transpose: boolean = false, array?: Float32Array): Float32Array {

        if (array === undefined) { array = new Float32Array(9); }

        if (transpose) {
            array[0] = this.a;
            array[1] = this.b;
            array[2] = 0;
            array[3] = this.c;
            array[4] = this.d;
            array[5] = 0;
            array[6] = this.tx;
            array[7] = this.ty;
            array[8] = 1;
        } else {
            array[0] = this.a;
            array[1] = this.c;
            array[2] = this.tx;
            array[3] = this.b;
            array[4] = this.d;
            array[5] = this.ty;
            array[6] = 0;
            array[7] = 0;
            array[8] = 1;
        }

        return array;

    }

    /**
    * Get a new position with the current transformation applied.
    *
    * Can be used to go from a childs coordinate space to the world coordinate space (e.g. rendering)
    *
    * @method Phaser.Matrix#apply
    * @param {Phaser.Point} pos - The origin Point.
    * @param {Phaser.Point} [newPos] - The point that the new position is assigned to. This can be same as input point.
    * @return {Phaser.Point} The new point, transformed through this matrix.
    */
    apply(pos: Point, newPos: Point = new Point()): Point {

        newPos.x = this.a * pos.x + this.c * pos.y + this.tx;
        newPos.y = this.b * pos.x + this.d * pos.y + this.ty;

        return newPos;

    }

    /**
    * Get a new position with the inverse of the current transformation applied.
    *
    * Can be used to go from the world coordinate space to a childs coordinate space. (e.g. input)
    *
    * @method Phaser.Matrix#applyInverse
    * @param {Phaser.Point} pos - The origin Point.
    * @param {Phaser.Point} [newPos] - The point that the new position is assigned to. This can be same as input point.
    * @return {Phaser.Point} The new point, inverse transformed through this matrix.
    */
    applyInverse(pos: Point, newPos: Point = new Point()): Point {

        let id = 1 / (this.a * this.d + this.c * -this.b);
        let x = pos.x;
        let y = pos.y;

        newPos.x = this.d * id * x + -this.c * id * y + (this.ty * this.c - this.tx * this.d) * id;
        newPos.y = this.a * id * y + -this.b * id * x + (-this.ty * this.a + this.tx * this.b) * id;

        return newPos;

    }

    /**
    * Translates the matrix on the x and y.
    * This is the same as Matrix.tx += x.
    *
    * @method Phaser.Matrix#translate
    * @param {number} x - The x value to translate on.
    * @param {number} y - The y value to translate on.
    * @return {Phaser.Matrix} This Matrix object.
    */
    translate(x: number, y: number): Matrix {

        this.tx += x;
        this.ty += y;

        return this;

    }

    /**
    * Applies a scale transformation to this matrix.
    *
    * @method Phaser.Matrix#scale
    * @param {number} x - The amount to scale horizontally.
    * @param {number} y - The amount to scale vertically.
    * @return {Phaser.Matrix} This Matrix object.
    */
    scale(x: number, y: number): Matrix {

        this.a *= x;
        this.d *= y;
        this.c *= x;
        this.b *= y;
        this.tx *= x;
        this.ty *= y;

        return this;

    }

    /**
    * Applies a rotation transformation to this matrix.
    *
    * @method Phaser.Matrix#rotate
    * @param {number} angle - The angle to rotate by, given in radians.
    * @return {Phaser.Matrix} This Matrix object.
    */
    rotate(angle: number): Matrix {

        let cos = Math.cos(angle);
        let sin = Math.sin(angle);

        let a1 = this.a;
        let c1 = this.c;
        let tx1 = this.tx;

        this.a = a1 * cos - this.b * sin;
        this.b = a1 * sin + this.b * cos;
        this.c = c1 * cos - this.d * sin;
        this.d = c1 * sin + this.d * cos;
        this.tx = tx1 * cos - this.ty * sin;
        this.ty = tx1 * sin + this.ty * cos;

        return this;

    }

    /**
    * Appends the given Matrix to this Matrix.
    *
    * @method Phaser.Matrix#append
    * @param {Phaser.Matrix} matrix - The matrix to append to this one.
    * @return {Phaser.Matrix} This Matrix object.
    */
    append(matrix: Matrix): Matrix {

        let a1 = this.a;
        let b1 = this.b;
        let c1 = this.c;
        let d1 = this.d;

        this.a  = matrix.a * a1 + matrix.b * c1;
        this.b  = matrix.a * b1 + matrix.b * d1;
        this.c  = matrix.c * a1 + matrix.d * c1;
        this.d  = matrix.c * b1 + matrix.d * d1;

        this.tx = matrix.tx * a1 + matrix.ty * c1 + this.tx;
        this.ty = matrix.tx * b1 + matrix.ty * d1 + this.ty;

        return this;

    }

    /**
    * Resets this Matrix to an identity (default) matrix.
    *
    * @method Phaser.Matrix#identity
    * @return {Phaser.Matrix} This Matrix object.
    */
    identity(): Matrix {

        return this.setTo(1, 0, 0, 1, 0, 0);

    }

}

export const identityMatrix = new Matrix();