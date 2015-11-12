/**
the global class constructor
@class
@classdesc a global class
@private
@param {number} - first param
@param {string} - second param
*/
function GlobalClass (one, two) {
  /** an instance property */
  this.propOne = 1
}
/** a static property */
GlobalClass.propTwo = 1

/** parent method one */
GlobalClass.prototype.methodOne = function () {}
/** parent method two */
GlobalClass.prototype.methodTwo = function () {}

/**
@class
@classdesc the child of global class
@extends GlobalClass
*/
function GlobalChildClass () {
  /**
  an instance property
  */
  this.propThree = 1
}
/** overridden child methodTwo */
GlobalChildClass.prototype.methodTwo = function () {}
