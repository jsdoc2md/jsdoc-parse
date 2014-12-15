"use strict";
var o = require("object-tools");
var a = require("array-tools");

var data;
exports.setID = setID;
exports.setIsExportedFlag = setIsExportedFlag;
exports.setCodename = setCodename;
exports.createConstructor = createConstructor;
exports.createConstructor2 = createConstructor2;

exports.setData = function(d){ data = d; return this; };
exports.getData = function(){ return data; };
exports.exportedClassIDs = exportedClassIDs;
exports.replaceQuotes = replaceQuotes;
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

function setIsExportedFlag(identifier){
    if (/module:/.test(identifier.name) && identifier.kind !== "module"){
        identifier.isExported = true;
    }
    return identifier;
}

function setCodename(identifier){
    if (identifier.meta && identifier.meta.code) identifier.codeName = identifier.meta.code.name;
    return identifier;
}

/* split each class found into two new items, then re-insert them over the original class */
function createConstructor(data){
    var replacements = [];

    data.forEach(function(identifier, index){
        if (identifier.kind === "class"){
            var constructor = o.extract(identifier, [ "description", "params", "examples", "returns" ]);

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
        data.splice.apply(data, spliceArgs);
    });
    
}

/**
converts .classdesc to .description
*/
function createConstructor2(identifier){
	if (identifier.kind !== "class"){
		throw "should only pass a class to createConstructor";
	}

    var replacements = [];
	identifier = o.clone(identifier);
    var constructor = o.extract(identifier, [ "description", "params", "examples", "returns" ]);
    if (identifier.classdesc){
        identifier.description = identifier.classdesc;
        delete identifier.classdesc;
    }
    identifier = sortIdentifier(identifier);
	replacements.push(identifier);

    /* only output a constructor if it's documentated */
    if(constructor.description || constructor.params){
        // constructor.id = newClass.id + "()";
        constructor.longname = identifier.longname;
        constructor.name = identifier.codeName || identifier.name;
        constructor.kind = "constructor";
        // constructor.memberof = newClass.id;
        constructor = sortIdentifier(constructor);
        // replacements.push({ index: index, items: [ newClass, constructor ]});
		replacements.push(constructor);
    } else {
        // replacements.push({ index: index, items: [ newClass ]});
    }
	return replacements;
}

/* 
for each exported class
*/
function exportedClassIDs(){
    update(data, { isExported: true }, function(exportedClass){
        var metaName = exportedClass.codeName;
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

/* removes unwanted quotes set by jsdoc if you specifiy a memberof such as `jquery.fn` */
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
