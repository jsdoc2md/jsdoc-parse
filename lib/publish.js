var o = require("object-tools");
var a = require("array-tools");

function Identifier(input){
    var self = this;
    var _input = o.clone(input);

    /* cherry-pick wanted properties while guaranteeing consistent order */
    this.id = input.id || input.longname;

    var fieldOrder = ["name", "scope", "kind", "isExported", "classdesc", "augments", "mixes", "description", "memberof", "alias", "params", "fires", "examples", "returns", "type", "defaultvalue", "readonly", "isEnum", "properties", "optional", "nullable", "variable", "author", "deprecated", "ignore", "access", "requires", "version", "licenses", "typicalname", "category", "see", "exceptions", "codeName" ];
    fieldOrder.forEach(function(field){
        if (_input[field]) self[field] = _input[field];
        delete _input[field];
    });
    
    if (input.tags){
        input.tags.forEach(function(tag){
            self[tag.title] = tag.value;
        });
    }

    if (input.meta && input.meta.code) self.codeName = input.meta.code.name;
    if (input.kind === "typedef" && !input.scope) self.scope = "global";

    if (/module:/.test(input.name) && input.kind !== "module"){
        self.isExported = true;
    }
}

/**
Generate documentation output.
@param {TAFFY} data - A TaffyDB collection representing all symbols
@param {object} opts - An object with options information.
*/
exports.publish = function(data) {

    /* take everything beside undocumented and package items */
    var json = data({ undocumented: { "!is": true }, kind: { "!is": "package" }}).map(function(record){
        return new Identifier(record);
    });

    /* split each class found into two new items, then re-insert them over the original class */
    var replacements = [];
    for (var i = 0; i < json.length; i++){
        var identifier = json[i];
        if (identifier.kind === "class"){
            var newClass = new Identifier(
                o.without(identifier, [ "description", "classdesc", "params", "examples", "returns" ])
            );
            if (identifier.classdesc) newClass.description = identifier.classdesc;

            /* only output a constructor if it's documentated */
            if(identifier.description || identifier.params){
                var constructor = new Identifier({
                    longname: newClass.id + "()",
                    name: identifier.codeName || identifier.name,
                    kind: "constructor",
                    description: identifier.description,
                    params: identifier.params,
                    returns: identifier.returns,
                    examples: identifier.examples,
                    memberof: newClass.id
                });
                replacements.push({ index: i, items: [ newClass, constructor ]});
            } else {
                replacements.push({ index: i, items: [ newClass ]});
            }
        }
    }

    replacements.reverse().forEach(function(replacement){
        var spliceArgs = [ replacement.index, 1 ].concat(replacement.items);
        json.splice.apply(json, spliceArgs);
    });

    /* find all the exported classes, update the ID to be something unique, then update the `id` and `memberof` fields of each child to reflect  */
    var exportedClasses = a.where(json, { kind: "class", name: /module:/ });
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
    if (input.meta && input.meta.code) input.codeName = input.meta.code.name;
    return o.without(input, [ "comment", "meta", "undocumented", "___id", "___s" ]);
}

function oldPublish(data) {
    var json = data({ undocumented: { "!is": true }, kind: { "!is": "package" }}).map(function(record){
        if (record.properties) {
            record.properties = record.properties.map(function(record){
                return wantedProperties(record);
            });
        }
        
        if (record.kind === "typedef" && !record.scope) record.scope = "global";
        return wantedProperties(record);
    });
    console.log(JSON.stringify(json, null, "  "));
};
