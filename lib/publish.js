var o = require("object-tools");
var a = require("array-tools");

function Identifier(input){
    var self = this;
    
    /* cherry-pick wanted properties while guaranteeing consistent order */
    this.id = input.id || input.longname;
    if (input.name) this.name = input.name;
    if (input.scope) this.scope = input.scope;
    if (input.kind) this.kind = input.kind;
    if (input.isExported) this.isExported = input.isExported;
    if (input.classdesc) this.classdesc = input.classdesc;
    if (input.augments) this.augments = input.augments;
    if (input.description) this.description = input.description;
    if (input.memberof) this.memberof = input.memberof;
    if (input.alias) this.alias = input.alias;
    if (input.params) this.params = input.params;
    if (input.examples) this.examples = input.examples;
    if (input.returns) this.returns = input.returns;
    if (input.type) this.type = input.type;
    if (input.defaultvalue) this.defaultvalue = input.defaultvalue;
    if (input.readonly) this.readonly = input.readonly;
    if (input.isEnum) this.isEnum = input.isEnum;
    if (input.optional) this.optional = input.optional;
    if (input.nullable) this.nullable = input.nullable;
    if (input.variable) this.variable = input.variable;
    if (input.author) this.author = input.author;
    if (input.deprecated) this.deprecated = input.deprecated;
    if (input.ignore) this.ignore = input.ignore;
    if (input.access) this.access = input.access;
    if (input.requires) this.requires = input.requires;
    if (input.version) this.version = input.version;
    if (input.licenses) this.licenses = input.licenses;
    if (input.typicalname) this.typicalname = input.typicalname;
    if (input.category) this.category = input.category;
    if (input.see) this.see = input.see;
    
    if (input.tags){
        input.tags.forEach(function(tag){
            self[tag.title] = tag.value;
        });
    }

    if (input.codeName) this.codeName = input.codeName;
    if (input.meta && input.meta.code) this.codeName = input.meta.code.name;
    if (input.kind === "typedef" && !input.scope) this.scope = "global";

    if (/module:/.test(input.name) && input.kind !== "module"){
        this.isExported = true;
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
                o.without(identifier, [ "description", "classdesc", "params", "examples" ])
            );
            if (identifier.classdesc) newClass.description = identifier.classdesc;

            var constructor = new Identifier({
                longname: newClass.id + "◊",
                name: identifier.codeName,
                kind: "constructor",
                description: identifier.description,
                params: identifier.params,
                examples: identifier.examples,
                memberof: newClass.id
            });

            replacements.push({ index: i, items: [ newClass, constructor ]});
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
