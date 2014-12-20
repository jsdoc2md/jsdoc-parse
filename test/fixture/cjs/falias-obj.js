/**
exports a pointer to a function
@module cjs/falias-obj
*/
module.exports = sum;

/**
the function
@alias module:cjs/falias-obj
*/
function sum(one, two){};

/**
a static method on the exported function
*/
sum.extra = function(){};
