/* test how each kind behaves within an IIFE */

(function(){

  /**
   * function
   */
  function func () {}

  /**
   * constant
   */
  const constant = 1

  /**
   * A class
   * @class
   * @param {number} - one
   * @param {number} - two
   */
  class SomeClass {
    constructor (one, two) {
      /**
       * @event SomeClass#something
       */
      this.emit('something')
    }
  }

  /**
   * variable
   */
  var member = 1

  /**
   * enum
   */
  const enum1 = {
    one: 1,
    two: 2
  }

  /**
   * namespace
   * @namespace object
   */
  var object = {
    /**
     * one
     */
    one: 1,
    /**
     * two
     */
    two: 2
  }

  /**
   * A typedef
   * @typedef typedefA
   * @property one {string}
   * @property two {string}
   */

}())
