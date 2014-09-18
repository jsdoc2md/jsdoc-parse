var o = require("object-tools");

function Identifier(input){
    /* cherry pick wanted properties while guaranteeing consistent output property order */
    if (input.longname) this.id = input.longname;
    if (input.name) this.name = input.name;
    if (input.scope) this.scope = input.scope;
    if (input.kind) this.kind = input.kind;
    if (input.description) this.description = input.description;
    if (input.params) this.params = input.params;

    if (input.meta && input.meta.code) this.codeName = input.meta.code.name;    
    if (input.kind === "typedef" && !input.scope) this.scope = "global";
}

/**
 * Generate documentation output.
 *
 * @param {TAFFY} data - A TaffyDB collection representing
 *                       all the symbols documented in your code.
 * @param {object} opts - An object with options information.
 */
exports.publish = function(data) {
    var json = data({ undocumented: { "!is": true }, kind: { "!is": "package" }}).map(function(record){
        return new Identifier(record);
    });
    
    
    console.log(JSON.stringify(json, null, "  "));
};
