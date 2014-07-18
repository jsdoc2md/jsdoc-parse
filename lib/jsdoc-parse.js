"use strict";
var cp = require("child_process"),
    path = require("path"),
    util = require("util"),
    a = require("array-tools"),
    t = require("typical"),
    fs = require("fs"),
    mfs = require("more-fs"),
    fileSet = require("file-set"),
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
@param {string | string[]} - source file(s) to parse
@param {object} - options
@param {boolean} [options.stats] - Return stats about the doclets parsed
@param {boolean} [options.private] - include @private members in the output
@returns {Stream} a readable stream containing the parsed json data
@example
Code like this: 
```js
parse("lib/jsdoc-parse.js").pipe(process.stdout);
```

would output something like: 
```json
[
  {
    "description": "Exports a single function (`parse`) to parse jsdoc data.",
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
            "string",
            "Array.<string>"
          ]
        },
        "description": "source file(s) to parse",
        "name": "src"
      },
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
            "boolean"
          ]
        },
        "optional": true,
        "description": "Return stats about the doclets parsed",
        "name": "options.stats"
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
    "name": "module:jsdoc-parse",
    "longname": "module:jsdoc-parse",
    "kind": "function"
  }
]
```
*/
function parse(src, options){
    if (t.isPlainObject(src) && !options){
        options = src;
        src = null;
    }
    if (src){
        options = options || {};
        src = fileSet(src).files;
        
        if (!src.length) throw new Error("[jsdoc-parse] need some input files");
        var output = new Output(options);
        var cmd = util.format(
    		"\"%s\" --pedantic -t \"%s\" %s",
    		path.resolve(__dirname, "..", "node_modules", ".bin", "jsdoc"),
    		path.resolve(__dirname, "..", "lib"),
    		src.join(" ")
    	);

        cp.exec(cmd, { maxBuffer: 50000 * 1024 }, function(err, stdout){
            if (err) {
                output.emit("error", err); 
            } else {
                output.end(stdout);
            }
        });
    
        return output;
    } else {
        var inputStream = new Transform();
        var tmpPath = mfs.getTempFilePath() + ".js";
        
        var buf = new Buffer(0);
        inputStream._transform = function(chunk, enc, done){
            if (chunk) buf = Buffer.concat([buf, chunk]);
            done();
        };
        inputStream._flush = function(done){
            var self = this;
            fs.writeFileSync(tmpPath, buf);
            
            var cmd = util.format(
        		"\"%s\" --pedantic -t \"%s\" %s",
        		path.resolve(__dirname, "..", "node_modules", ".bin", "jsdoc"),
        		path.resolve(__dirname, "..", "lib"),
        		tmpPath
        	);

            cp.exec(cmd, { maxBuffer: 50000 * 1024 }, function(err, stdout){
                if (err){ 
                    done(err);
                } else {
                    self.push(stdout);
                    done();
                }
                mfs.deleteFile(tmpPath);
            });
        };
        return inputStream;
    }
}

function Output(options){
    Transform.call(this);
    this.json = new Buffer(0);
    this._transform = function(chunk, enc, done){
        if (chunk) this.json = Buffer.concat([ this.json, chunk ]);
        done();
    };
    this._flush = function(){
        var data;
        try {
            data = JSON.parse(this.json.toString());
        } catch(err){
            err.message += " [input data: " + this.json.substr(0, 100) + "]";
            return this.emit("error", err);
        }
        data = data.filter(function(item){
            if (options.private){
                return item.ignore === undefined;
            } else {
                return item.ignore === undefined && item.access !== "private";
            }
        });
        
        if(options.stats) {
            var stats = {};
            stats.memberof = a.unique(a.pluck(data, "memberof"));
            stats.class = a.pluck(a.where(data, { kind: "class" }), "longname");
            stats.module = a.pluck(a.where(data, { kind: "module" }), "longname");

            this.push(JSON.stringify(stats, null, "  "));
        } else {
            this.push(JSON.stringify(data, null, "  "));
        }
        this.push(null);
    };
}
util.inherits(Output, Transform);
