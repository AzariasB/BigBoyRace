

    export enum Corner {
        TOP_LEFT,
        TOP_RIGHT,
        TOP_CENTER,
        CENTER_LEFT,
        CENTER_RIGHT,
        BOTTOM_LEFT,
        BOTTOM_CENTER,
        BOTTOM_RIGHT,
        CENTER
    }

    export enum Facing {
        NONE,
        LEFT,
        RIGHT,
        UP,
        DOWN
    }

export namespace MMaths {

    export const RAD_TO_DEG = 180 / Math.PI;

    export const PI_2 = Math.PI * 2;

    /**
    * Degrees to Radians factor.
    * @property {number} Phaser.Math#DEG_TO_RAD
    */
   export const DEG_TO_RAD = Math.PI / 180;

    export function clamp(val: number, min: number, max: number) {
        return val < min ? min : val > max ? max : val;
    }


    export function radToDeg(radians: number): number {
        return radians * RAD_TO_DEG;
    }

    /**
    * Two number are fuzzyEqual if their difference is less than epsilon.
    *
    * @method Phaser.Math#fuzzyEqual
    * @param {number} a - The first number to compare.
    * @param {number} b - The second number to compare.
    * @param {number} [epsilon=0.0001] - The epsilon (a small value used in the calculation)
    * @return {boolean} True if |a-b|<epsilon
    */
   export function fuzzyEqual(a: number, b: number, epsilon: number): boolean {

       if (epsilon === undefined) { epsilon = 0.0001; }

       return Math.abs(a - b) < epsilon;

   }

       /**
    * Returns the euclidian distance between the two given set of coordinates.
    *
    * @method Phaser.Math#distance
    * @param {number} x1
    * @param {number} y1
    * @param {number} x2
    * @param {number} y2
    * @return {number} The distance between the two sets of coordinates.
    */
   export function distance(x1: number, y1: number, x2: number, y2: number): number {

        let dx = x1 - x2;
        let dy = y1 - y2;

        return Math.sqrt(dx * dx + dy * dy);

    }

        /**
    * Convert degrees to radians.
    *
    * @method Phaser.Math#degToRad
    * @param {number} degrees - Angle in degrees.
    * @return {number} Angle in radians.
    */
    export function degToRad(degrees: number): number {

       return degrees * DEG_TO_RAD;

    }

        /**
    * Ensures that the value always stays between min and max, by wrapping the value around.
    *
    * If `max` is not larger than `min` the result is 0.
    *
    * @method Phaser.Math#wrap
    * @param {number} value - The value to wrap.
    * @param {number} min - The minimum the value is allowed to be.
    * @param {number} max - The maximum the value is allowed to be, should be larger than `min`.
    * @return {number} The wrapped value.
    */
    export function wrap(value: number, min: number, max: number): number {

        let range = max - min;

        if (range <= 0) {
            return 0;
        }

        let result = (value - min) % range;

        if (result < 0) {
            result += range;
        }

        return result + min;

    }

    /**
    * Ensures that the value always stays between min and max, by wrapping the value around.
    *
    * If `max` is not larger than `min` the result is 0.
    *
    * @method Phaser.Math#wrap
    * @param {number} value - The value to wrap.
    * @param {number} min - The minimum the value is allowed to be.
    * @param {number} max - The maximum the value is allowed to be, should be larger than `min`.
    * @return {number} The wrapped value.
    */
    wrap: function (value, min, max)
    {

        var range = max - min;

        if (range <= 0)
        {
            return 0;
        }

        var result = (value - min) % range;

        if (result < 0)
        {
            result += range;
        }

        return result + min;

    },