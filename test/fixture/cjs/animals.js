/**
exports animals
@module
*/

/**
the exported cat
@type {Animal}
*/
exports.cat = new Animal();

/**
the exported dog
@type {Animal}
*/
exports.dog = new Animal();

/**
@class
*/
function Animal(){
    
    /**
    @class
    */
    function Quadroped(){
        /**
        leg count
        */
        this.legs = 4;
    }
    
    /**
    animal type
    @type {Quadroped}
    */
    this.type = new Quadroped();
}
