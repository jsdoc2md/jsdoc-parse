"use strict";
var o = require("object-tools");
var a = require("array-tools");
var transform = require("./transform");

/**
Generate documentation output.
@param {TAFFY} data - A TaffyDB collection representing all symbols
@param {object} opts - An object with options information.
*/
exports.publish = function(data) {
    var query = { "!undocumented": true, "!kind": /package|file/ };
    var json = a.where(data().get(), query)
        .map(transform.setID)
        .map(transform.setIsExportedFlag)
        .map(transform.removeQuotes)
        .map(transform.cleanProperties)
        .map(transform.buildTodoList)
        .map(transform.extractTypicalName)
        .map(transform.extractCategory)
        .map(transform.extractCustomTags)
        .map(transform.setTypedefScope)
        .map(transform.setCodename)
        .map(transform.sortIdentifier)
        .map(transform.wantedProperties);

    transform.setData(json).exportedClassIDs();
    json = transform.getData();
    transform.createConstructor(json);

    // update(json, { isExported: true }, function(item){
    //     return {
    //         id: item.id + "--" + item.codeName,
    //         name: item.codeName,
    //         memberof: item.name
    //     }
    // });

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
