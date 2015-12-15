/**
 * @module es6-class
 */

/**
 * a global class
 * @alias module:es6-class
 */
class GlobalClass {
  /**
   * the global class constructor
   * @param {number} - first param
   * @param {string} - second param
   */
  constructor (one, two) {
    /** an instance property */
    this.propOne = 1
  }

  /** a static method */
  static shat () {}

  /** parent method one */
  methodOne () {}
  /** parent method two */
  methodTwo () {}
}

/**
 * the child of global class
 * @extends GlobalClass
 */
class GlobalChildClass extends GlobalClass {
  constructor () {
    /** an instance property */
    this.propThree = 1
  }

  /** overridden child methodTwo */
  methodTwo () {}
}

module.exports = GlobalClass
