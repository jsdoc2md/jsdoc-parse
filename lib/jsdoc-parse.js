"use strict";
var cp = require("child_process"),
    path = require("path"),
    util = require("util"),
    fs = require("fs"),
    a = require("array-tools"),
    Transform = require("stream").Transform;

/**
@module
@example
```js
var parse = require("jsdoc-parse");
```
*/
module.exports = parse;

/**
@alias module:jsdoc-parse
@param {object} - options
@param {string[]} [options.src] - an array of source files to parse
@param {boolean} [options.private] - include @private members in the output
@returns {Transform}
*/
function parse(options){
    if (!options.src) throw new Error("Please supply at least one source file");
    options.src = a.arrayify(options.src);
    
    var output = new Fixer(options);
    var cmd = util.format(
		"%s -t %s %s",
		path.resolve(__dirname, "..", "node_modules", ".bin", "jsdoc"),
		path.resolve(__dirname, "..", "lib"),
		options.src.join(" ")
	);

    cp.exec(cmd, { maxBuffer: 1000 * 1024 }, function(err, stdout){
        if (err) throw(err); 
        output.end(stdout);
    });
    
    return output;
}

function Fixer(options){
    Transform.call(this);
    this.json = new Buffer(0);
    this._transform = function(chunk, enc, done){
        if (chunk) this.json = Buffer.concat([ this.json, chunk ]);
        done();
    };
    this._flush = function(){
        var data = JSON.parse(this.json.toString());
        data = data.filter(function(item){
            if (options.private){
                return item.ignore === undefined;
            } else {
                return item.ignore === undefined && item.access !== "private";
            }
        });
        this.push(JSON.stringify(data, null, "  "));
    };
}
util.inherits(Fixer, Transform);
