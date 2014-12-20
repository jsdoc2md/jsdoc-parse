/**
exports a class
@module cjs/class
@typicalname exp
*/
module.exports = ExportedClass;

/**
the exported contructor
@class
@classdesc the exported class
@alias module:cjs/class
*/
function ExportedClass(one, two){
    /**
    instance property
    */
    this.prop = 1;
};
/**
a static property for the exported class
*/
ExportedClass.staticProp = 1;

/**
inner module property 
*/
var innerProp = 1;
