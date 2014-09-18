var o = require("object-tools");
var a = require("array-tools");

function Identifier(input){
    /* cherry-pick wanted properties while guaranteeing consistent order */
    this.id = input.id || input.longname;
    if (input.name) this.name = input.name;
    if (input.scope) this.scope = input.scope;
    if (input.kind) this.kind = input.kind;
    if (input.classdesc) this.classdesc = input.classdesc;
    if (input.description) this.description = input.description;
    if (input.memberof) this.memberof = input.memberof;
    if (input.alias) this.alias = input.alias;
    if (input.params) this.params = input.params;
    if (input.examples) this.examples = input.examples;

    if (input.codeName) this.codeName = input.codeName;
    if (input.meta && input.meta.code) this.codeName = input.meta.code.name;
    if (input.kind === "typedef" && !input.scope) this.scope = "global";

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

            // /* exported class */
            // if (newClass.name.search(/module:/) > -1){
            //     newClass.memberof = newClass.name;
            //     // newClass.name = identifier.codeName;
            //     // newClass.id += "^" + identifier.codeName;
            // }

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
    
    update(json, { kind: "class", name: /module:/ }, function(item){
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
