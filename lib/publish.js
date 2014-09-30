"use strict";
var o = require("object-tools");
var a = require("array-tools");

/**
Generate documentation output.
@param {TAFFY} data - A TaffyDB collection representing all symbols
@param {object} opts - An object with options information.
*/
exports.publish = function(data) {
    var replacements = [];

    /* take everything beside undocumented and package items */
    var json = data({ undocumented: { "!is": true }, kind: { "!is": "package" }}).map(function(record){
        record.name = record.name.replace(/"/g, "");
        if (record.memberof) record.memberof = record.memberof.replace(/"/g, "");
        record.id = record.longname.replace(/"/g, "");
        delete record.longname; 
        
        if (record.properties) {
            record.properties = record.properties.map(function(record){
                return wantedProperties(record);
            });
        }
        
        if (record.tags){
            var typicalName = a.extract(record.tags, { title: "typicalname"});
            if (typicalName.length) record.typicalname = typicalName[0].value;
            var category = a.extract(record.tags, { title: "category"});
            if (category.length) record.category = category[0].value;
            if (record.tags.length > 0){
                record.customTags = record.tags.map(function(tag){
                    return {
                        tag: tag.title,
                        value: tag.value
                    };
                });
            }
            delete record.tags;
        }
        
        if (record.kind === "typedef" && !record.scope) record.scope = "global";
        if (record.meta && record.meta.code) record.codeName = record.meta.code.name;
        
        if (/module:/.test(record.name) && record.kind !== "module"){
            record.isExported = true;
        }
        
        record = sortIdentifier(record);
        return wantedProperties(record);
    });

    /* split each class found into two new items, then re-insert them over the original class */
    json.forEach(function(identifier, index){
        if (identifier.kind === "class"){
            var constructor = extract(identifier, [ "description", "params", "examples", "returns" ]);
            
            var newClass = identifier;
            if (newClass.classdesc){
                newClass.description = newClass.classdesc;
                delete newClass.classdesc;
            }
            newClass = sortIdentifier(newClass);
            
            /* only output a constructor if it's documentated */
            if(constructor.description || constructor.params){
                constructor.id = newClass.id + "()";
                constructor.name = identifier.codeName || identifier.name;
                constructor.kind = "constructor";
                constructor.memberof = newClass.id;
                constructor = sortIdentifier(constructor);
                replacements.push({ index: index, items: [ newClass, constructor ]});
            } else {
                replacements.push({ index: index, items: [ newClass ]});
            }
        }
    });

    replacements.reverse().forEach(function(replacement){
        var spliceArgs = [ replacement.index, 1 ].concat(replacement.items);
        json.splice.apply(json, spliceArgs);
    });

    /* find all the exported classes, update the ID to be something unique, then update the `id` and `memberof` fields of each child to reflect  */
    var exportedClasses = a.where(json, { kind: /class|function/, name: /module:/ });
    exportedClasses.forEach(function(exportedClass){
        var newClassID = exportedClass.id + "^" + exportedClass.codeName;
        update(
            json,
            { memberof: exportedClass.id, "!id": exportedClass.id },
            function(item){
                return {
                    memberof: newClassID,
                    id: item.id.replace(exportedClass.id, newClassID)
                }
            }
        );
    });

    update(json, { isExported: true }, function(item){
        return {
            id: item.id + "^" + item.codeName,
            name: item.codeName,
            memberof: item.name
        }
    });

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

function wantedProperties(input){
    return o.without(input, [ "comment", "meta", "undocumented", "___id", "___s" ]);
}

function extract(object, propertyArray){
    var output = {};
    propertyArray.forEach(function(prop){
        output[prop] = object[prop];
        delete object[prop];
    });
    return output;
}

function sort(object, sortFunction){
    var output = {};
    var newPropertyOrder = Object.keys(object).sort(sortFunction);
    newPropertyOrder.forEach(function(prop){
        output[prop] = object[prop];
    });
    return output;
}

function sortIdentifier(object){
    var fieldOrder = ["id", "name", "scope", "kind", "isExported", "classdesc", "augments", "mixes", "description", "memberof", "alias", "params", "fires", "examples", "returns", "type", "defaultvalue", "readonly", "isEnum", "properties", "optional", "nullable", "variable", "author", "deprecated", "ignore", "access", "requires", "version", "licenses", "typicalname", "category", "see", "exceptions", "codeName" ];
    return sort(object, function(a, b){
        if (fieldOrder.indexOf(a) === -1 && fieldOrder.indexOf(b) > -1){
            return 1;
        } else {
            return fieldOrder.indexOf(a) - fieldOrder.indexOf(b)
        }
    });
}