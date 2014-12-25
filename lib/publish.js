/* 
store IDs which have been updated in a module level var.. any subsequent members found with this ID are updated.. depends on sort order, i.e. exported class first.
*/
"use strict";
var o = require("object-tools");
var a = require("array-tools");
var transform = require("./transform");

/**
This is a jsdoc plugin. It transforms jsdoc format data to the preferred jsdoc-parse format.
@param {TAFFY} data - A TaffyDB collection representing all the symbols documented in your code.
@param {object} opts - An object with options information.
*/
exports.publish = function(data) {
    var query = { "!undocumented": true, "!kind": /package|file/ };
    var json = a.where(data().get(), query);

    json = json.map(transform.setIsExportedFlag);
    json = json.map(transform.setCodename);
    json = transform.insertConstructors(json);
    
    json = json.map(function(identifier){
        identifier = transform.setID(identifier);
        
        identifier = transform.removeQuotes(identifier);
        identifier = transform.cleanProperties(identifier);
        identifier = transform.buildTodoList(identifier);
        identifier = transform.extractTypicalName(identifier);
        identifier = transform.extractCategory(identifier);
        identifier = transform.extractCustomTags(identifier);
        identifier = transform.setTypedefScope(identifier);
        return identifier;
    });
    
    var exported = a.where(json, { isExported: true });
    var newIDs = a.pluck(exported, "id");
    
    newIDs.forEach(function(newID){
        update(json, { isExported: undefined, "!kind": "module" }, function(identifier){
            return transform.updateIDReferences(identifier, newID);
        });
    });


    // /* verify each identifier's `memberof`. If `memberof` does not point to a valid `id` or `name` then throw a warning?  */
    // json.forEach(function(identifier){
    //     var memberof = identifier.memberof;
    //     if (memberof){
    //         var parent = a.findWhere(json, { id: memberof });
    //         if (!parent){
    //             var parent2 = a.findWhere(json, { name: memberof, "!kind": "constructor" });
    //             if (parent2){
    //                 identifier.memberof = parent2.id;
    //             } else {
    //                 identifier.memberof = "INVALID memberof: " + memberof;
    //                 // throw new Error("invalid memberof: " + memberof);
    //             }
    //         }
    //     }
    // });


    json = json.map(transform.removeUnwanted);
    json = json.map(transform.sortIdentifier);
    
    console.log(JSON.stringify(json, null, "  "));
};

function update(array, query, newValues){
    for (var i = 0; i < array.length; i++){
        if (o.exists(array[i], query)){
            var values = typeof newValues === "function" ? newValues(array[i]) : newValues;
            for (var prop in values){
                array[i][prop] = values[prop];
            }
        }
    }
}
