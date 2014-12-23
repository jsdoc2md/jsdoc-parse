"use strict";
var o = require("object-tools");
var a = require("array-tools");

var data;
exports.createConstructor = createConstructor;
exports.insertConstructors = insertConstructors;
exports.setIsExportedFlag = setIsExportedFlag;
exports.setCodename = setCodename;
exports.setID = setID;
exports.updateIDReferences = updateIDReferences;

exports.setData = function(d){ data = d; return this; };
exports.getData = function(){ return data; };
exports.removeQuotes = removeQuotes;
exports.wantedProperties = wantedProperties;
exports.removeUnwanted = removeUnwanted;
exports.cleanProperties = cleanProperties;
exports.buildTodoList = buildTodoList;
exports.extractTypicalName = extractTypicalName;
exports.extractCategory = extractCategory;
exports.extractCustomTags = extractCustomTags;
exports.setTypedefScope = setTypedefScope;
exports.sortIdentifier = sortIdentifier;

/**
Create a unique ID (the jsdoc `longname` field is not guaranteed unique)
@depends setIsExportedFlag
@depends setCodename
*/
function setID(identifier){
    if (identifier.longname){
		identifier.id = identifier.longname;
	}
	if (identifier.kind === "constructor"){
		identifier.id = identifier.longname + "()";
	}
	if (identifier.isExported){
		identifier.id = identifier.longname + "--" + identifier.codeName;
	}
    return identifier;
}

/**
run after setIsExportedFlag has processed using old name value
@depends setIsExportedFlag
*/
function setCodename(identifier){
    if (identifier.meta && identifier.meta.code){
        identifier.codeName = identifier.meta.code.name;
        if (identifier.isExported) identifier.name = identifier.codeName;
    }
    return identifier;
}

/**
*/
function setIsExportedFlag(identifier){
    if (/module:/.test(identifier.name) && identifier.kind !== "module" && identifier.kind !== "constructor"){
        identifier.isExported = true;
        identifier.memberof = identifier.longname;        
    }
    return identifier;
}

/**
converts .classdesc to .description
@returns Array - contains the class and constructor identifiers
@depends setCodename
*/
function createConstructor(identifier){
	if (identifier.kind !== "class"){
		throw "should only pass a class to createConstructor";
	}

    var replacements = [];
	identifier = o.clone(identifier);
    var constructor = o.extract(identifier, [ "description", "params", "examples", "returns", "exceptions" ]);
    if (identifier.classdesc){
        identifier.description = identifier.classdesc;
        delete identifier.classdesc;
    }
	replacements.push(identifier);

    /* only output a constructor if it's documentated */
    if(constructor.description || constructor.params){
        constructor.longname = identifier.longname;
        constructor.name = identifier.codeName || identifier.name;
        constructor.kind = "constructor";
        constructor.memberof = identifier.longname;
		replacements.push(constructor);
    }
	return replacements;
}

/* split each class found into two new items, then re-insert them over the original class */
function insertConstructors(data){
    var replacements = [];

    data.forEach(function(identifier, index){
        if (identifier.kind === "class"){
            replacements.push({ index: index, items: createConstructor(identifier) });
        }
    });

    replacements.reverse().forEach(function(replacement){
        var spliceArgs = [ replacement.index, 1 ].concat(replacement.items);
        data.splice.apply(data, spliceArgs);
    });
    
    return data;
}

function updateIDReferences(identifier, newID){
    var oldID = newID.split("--")[0];
    if (oldID && !identifier.isExported){
        if (identifier.id) identifier.id = identifier.id.replace(oldID, newID);
        if (identifier.memberof) identifier.memberof = identifier.memberof.replace(oldID, newID);
        if (identifier.name) identifier.name = identifier.name.replace(oldID, newID);
        if (identifier.type && identifier.type.names){
            identifier.type.names = identifier.type.names.map(function(id){
                return id.replace(oldID, newID);
            });
        }
        if (identifier.returns){
            identifier.returns = identifier.returns.map(function(identifier){
                if (identifier.type && identifier.type.names){
                    identifier.type.names = identifier.type.names.map(function(id){
                        return id.replace(oldID, newID);
                    });
                }
                return identifier;
            });
        }
    }
    return identifier;
}

/* removes unwanted quotes set by jsdoc if you specifiy a memberof such as `jquery.fn` */
function removeQuotes(identifier){
    if (identifier.name) identifier.name = identifier.name.replace(/"/g, "");
    if (identifier.memberof) identifier.memberof = identifier.memberof.replace(/"/g, "");
    if (identifier.longname) identifier.longname = identifier.longname.replace(/"/g, "");
    if (identifier.id) identifier.id = identifier.id.replace(/"/g, "");
    return identifier;
}

function removeUnwanted(identifier){
    delete identifier.longname;
    delete identifier.todo;
    delete identifier.tags;

    delete identifier.comment;
    delete identifier.meta;
    delete identifier.undocumented;
    delete identifier.___id;
    delete identifier.___s;

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

function wantedProperties(input){
    return o.without(input, [ "comment", "meta", "undocumented", "___id", "___s" ]);
}

function buildTodoList(identifier){
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
        var tags = identifier.tags.slice(0);
        var done = a.extract(tags, { title: "done" });
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

function sort(object, sortFunction){
    var output = {};
    var newPropertyOrder = Object.keys(object).filter(function(prop){
        return typeof object[prop] !== "function";
    }).sort(sortFunction);
    newPropertyOrder.forEach(function(prop){
        output[prop] = object[prop];
    });
    return output;
}

function sortIdentifier(identifier){
    var fieldOrder = [ "id", "name", "scope", "kind", "isExported", "classdesc", "augments", "mixes", "description", "memberof", "alias", "params", "fires", "examples", "returns", "type", "defaultvalue", "readonly", "isEnum", "properties", "optional", "nullable", "variable", "author", "deprecated", "ignore", "access", "requires", "version", "since", "licenses", "license", "typicalname", "category", "see", "exceptions", "codeName", "todoList", "customTags" ];
    return sort(identifier, function(a, b){
        if (fieldOrder.indexOf(a) === -1 && fieldOrder.indexOf(b) > -1){
            return 1;
        } else {
            return fieldOrder.indexOf(a) - fieldOrder.indexOf(b)
        }
    });
}

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
