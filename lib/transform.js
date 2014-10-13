"use strict";
var o = require("object-tools");
var a = require("array-tools");

var data;
exports.setData = function(d){ data = d; return this; };
exports.getData = function(){ return data; };
exports.setIsExportedFlag = setIsExportedFlag;
exports.setIDs = setIDs;
exports.exportedClassIDs = exportedClassIDs;
exports.replaceQuotes = replaceQuotes;
exports.setID = setID;
exports.removeQuotes = removeQuotes;
exports.wantedProperties = wantedProperties;
exports.removeUnwanted = removeUnwanted;
exports.cleanProperties = cleanProperties;
exports.buildTodoList = buildTodoList;
exports.extractTypicalName = extractTypicalName;
exports.extractCategory = extractCategory;
exports.extractCustomTags = extractCustomTags;
exports.setTypedefScope = setTypedefScope;
exports.setCodename = setCodename;
exports.sortIdentifier = sortIdentifier;
// exports.setCodename = setCodename;
// exports.setCodename = setCodename;

function update(array, query, newValues){
    for (var i = 0; i < array.length; i++){
        if (o.exists(array[i], query)){
            var values = typeof newValues === "function" ? newValues(array[i]) : newValues;
            for (var prop in values){
                if (values[prop] !== undefined) array[i][prop] = values[prop];
            }
        }
    }
}

function exportedClassIDs(){
    update(data, { isExported: true }, function(exportedClass){
        var metaName = exportedClass.meta && exportedClass.meta.code && exportedClass.meta.code.name;
        var oldClassID = exportedClass.longname;
        var newClassID = oldClassID + "--" + metaName;        

        update(data, { "!longname": oldClassID }, function(identifier){
            return {
                id: identifier.longname && identifier.longname.replace(oldClassID, newClassID),
                memberof: identifier.memberof && identifier.memberof.replace(oldClassID, newClassID),
                returns: identifier.returns && identifier.returns.map(function(ret){
                    if (ret.type.names){
                        ret.type.names = ret.type.names.map(function(name){
                            return name.replace(oldClassID, newClassID);
                        });
                    }
                    return ret;
                }),
                type: identifier.type && identifier.type.names  && {
                    names: identifier.type.names.map(function(name){
                        return name.replace(oldClassID, newClassID);
                    })
                } 
            };
        });

        return { id: newClassID, name: metaName, isExported: true };
    });
    
    return this;
}

function setIsExportedFlag(identifier){
    if (/module:/.test(identifier.name) && identifier.kind !== "module"){
        identifier.isExported = true;
    }
    return identifier;
}

function setIDs(){
    update(data, null, function(identifier){
        return { id: identifier.longname };
    });
    return this;
}

function replaceQuotes(){
    update(data, null, function(identifier){
        return { 
            name: identifier.name.replace(/"/g, ""),
            memberof: identifier.memberof && identifier.memberof.replace(/"/g, ""),
            id: identifier.id.replace(/"/g, "")
        };
    });
    return this;
}

function setID(identifier){
    identifier.id = identifier.longname;
    return identifier;
}

function removeQuotes(identifier){
    identifier.name = identifier.name.replace(/"/g, "");
    if (identifier.memberof) identifier.memberof = identifier.memberof.replace(/"/g, "");
    identifier.id = identifier.id.replace(/"/g, "");
    return identifier;
}

function wantedProperties(input){
    return o.without(input, [ "comment", "meta", "undocumented", "___id", "___s" ]);
}

function removeUnwanted(identifier){
    delete identifier.longname;
    delete identifier.todo;
    delete identifier.tags;
    
    return identifier;
}

function cleanProperties(identifier){
    if (identifier.properties) {
        identifier.properties = identifier.properties.map(function(prop){
            return wantedProperties(prop);
        });
    }
    return identifier;
}

function buildTodoList(identifier){
    /* build a todoList */
    var todoList = [];
    if (identifier.todo){
        var todo = a.arrayify(identifier.todo);
        todoList = todoList.concat(todo.map(function(task){
            return { done: false, task: task };
        }));
    }

    /*
    Convert @typicalname and @category from custom to regular tags.
    Combine @todo array with @done custom tags to make @todoList
    */
    if (identifier.tags){
        var done = a.extract(identifier.tags, { title: "done" });
        todoList = todoList.concat(done.map(function(task){
            return { done: true, task: task.value };
        }));
    }
    
    if (todoList.length){
        identifier.todoList = todoList;
    }
    return identifier;
}

function extractTypicalName(identifier){
    if (identifier.tags){
        var typicalName = a.extract(identifier.tags, { title: "typicalname"});
        if (typicalName.length) identifier.typicalname = typicalName[0].value;
    }
    return identifier;
}

function extractCategory(identifier){
    if (identifier.tags){
        var category = a.extract(identifier.tags, { title: "category"});
        if (category.length) identifier.category = category[0].value;
    }
    return identifier;
}

function extractCustomTags(identifier){
    if (identifier.tags && identifier.tags.length > 0){
        identifier.customTags = identifier.tags.map(function(tag){
            return {
                tag: tag.title,
                value: tag.value
            };
        });
    }
    return identifier;
}

function setTypedefScope(identifier){
    if (identifier.kind === "typedef" && !identifier.scope) identifier.scope = "global";
    return identifier;
}

function setCodename(identifier){
    if (identifier.meta && identifier.meta.code) identifier.codeName = identifier.meta.code.name;
    return identifier;
}

function sort(object, sortFunction){
    var output = {};
    var newPropertyOrder = Object.keys(object).sort(sortFunction);
    newPropertyOrder.forEach(function(prop){
        output[prop] = object[prop];
    });
    return output;
}

function sortIdentifier(identifier){
    var fieldOrder = ["id", "name", "scope", "kind", "isExported", "classdesc", "augments", "mixes", "description", "memberof", "alias", "params", "fires", "examples", "returns", "type", "defaultvalue", "readonly", "isEnum", "properties", "optional", "nullable", "variable", "author", "deprecated", "ignore", "access", "requires", "version", "licenses", "typicalname", "category", "see", "exceptions", "codeName" ];
    return sort(identifier, function(a, b){
        if (fieldOrder.indexOf(a) === -1 && fieldOrder.indexOf(b) > -1){
            return 1;
        } else {
            return fieldOrder.indexOf(a) - fieldOrder.indexOf(b)
        }
    });
}