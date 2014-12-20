/**
exports a class
@module cjs/human
@typicalname d
*/
module.exports = Human;

/**
the exported contructor
@class
@classdesc the exported class
@alias module:cjs/human
*/
function Human(){
    
    /**
    @class
    @classdesc a class inside a class
    */
    function Organ(){
        
        /**
        @class
        @classdesc a class inside a class inside a class
        */        
        function Cell(){}
        
        /**
        an instance of Cell
        @type {module:cjs/human~Organ~Cell}
        */
        this.redCell = new Cell();
    }
    
    /**
    an instance of Organ
    @type {module:cjs/human~Organ}
    */
    this.liver = new Organ();
};
