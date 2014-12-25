/**
exports a pointer to a function
@module cjs/function-alias
*/
module.exports = sum;

/**
the function
@param {number} - the first number
@param {number} - the second number
@returns {number} the calculation result
@alias module:cjs/function-alias
*/
function sum(one, two){};

/**
an additional static property
*/
sum.sumthingStatic = 1;
