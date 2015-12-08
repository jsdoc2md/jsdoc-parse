/* class instance property docs not output if `@module` specified  */

/**
 * @module something
 */

/**
 * constructor description
 * @class
 * @classdesc create something
 */
function Something () {
    /**
     * a value
     * @type {number}
     */
    this.whatever = 1
}
