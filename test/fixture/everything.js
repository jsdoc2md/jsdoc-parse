/**
a global var
@type {string}
@default "something"
*/
var globalVar = "something";

/**
a global function
@param {number} - first param
@param {string} - second param
*/
function globalFunction(one, two){}

/**
the global class constructor
@class
@classdesc a global class
@param {number} - first param
@param {string} - second param
@extends {String}
*/
function GlobalClass(one, two){
    /**
    an instance property
    */
    this.propOne = 1;
}
/**
a static property
*/
GlobalClass.propTwo = 1;
