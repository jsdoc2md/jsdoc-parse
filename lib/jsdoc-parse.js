"use strict";
var cp = require("child_process"),
    path = require("path"),
    util = require("util"),
    fs = require("fs"),
    a = require("array-tools"),
    Transform = require("stream").Transform;

/**
Exports a single function (`parse`) to parse jsdoc data.
@module
@example
```js
var parse = require("jsdoc-parse");
```
*/
module.exports = parse;

/**
Documented javascript source files in, doclet data out.
@alias module:jsdoc-parse
@param {object} - options
@param {string | string[]} [options.src] - source file(s) to parse
@param {boolean} [options.private] - include @private members in the output
@returns {Stream} a readable stream containing the parsed json data
@example
```js
> parse({ src: "lib/jsdoc-parse.js" }).pipe(process.stdout);
[
  {
    "kind": "module",
    "name": "jsdoc-parse",
    "examples": [
      "```js\nvar parse = require(\"jsdoc-parse\");\n```"
    ],
    "longname": "module:jsdoc-parse"
  },
  {
    "description": "Documented javascript source files in, doclet data out.",
    "alias": "module:jsdoc-parse",
    "params": [
      {
        "type": {
          "names": [
            "object"
          ]
        },
        "description": "options",
        "name": "options"
      },
      {
        "type": {
          "names": [
            "string",
            "Array.<string>"
          ]
        },
        "optional": true,
        "description": "source file(s) to parse",
        "name": "options.src"
      },
      {
        "type": {
          "names": [
            "boolean"
          ]
        },
        "optional": true,
        "description": "include @private members in the output",
        "name": "options.private"
      }
    ],
    "returns": [
      {
        "type": {
          "names": [
            "Stream"
          ]
        },
        "description": "a readable stream containing the parsed json data"
      }
    ],
    "examples": [
      "```js\nparse({ src: \"lib/jsdoc-parse.js\" }).pipe(process.stdout);\n```"
    ],
    "name": "module:jsdoc-parse",
    "longname": "module:jsdoc-parse",
    "kind": "function",
    "codeName": "parse"
  },
  {
    "files": [
      "/Users/Lloyd/Documents/75lb/jsdoc-parse/lib/jsdoc-parse.js"
    ],
    "kind": "package",
    "longname": "package:undefined"
  }
]
```
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
        this.push(null);
    };
}
util.inherits(Fixer, Transform);
