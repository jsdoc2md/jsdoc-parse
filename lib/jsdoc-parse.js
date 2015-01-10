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
@module jsdoc-parse
@example
```js
var parse = require("jsdoc-parse");
```
*/
module.exports = parse;

/**
Documented javascript source in, documentation JSON out.
@alias module:jsdoc-parse
@todo split into two separate methods
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
  etc,
  etc
]
```
*/
function parse(src, options){
    if (t.isPlainObject(src) && !options){
        options = src;
        src = null;
    }
    options = options || {};
    if (src){
        var inputFiles = fileSet(src);
        src = inputFiles.files;

        var output = new OutputTransform(options);

        if (!src.length){
            var msg = util.format("[jsdoc-parse] please specify valid input files. ");
            if (inputFiles.notExisting){
                msg+= "These files do not exist: " + inputFiles.notExisting.join(", ");
            }
            /* defer, to give client chance to attach listener */
            process.nextTick(function(){
                output.emit("error", new Error(msg));
            });
        } else {
            getJsdocOutput(src, options, function(err, data){
                if (err) {
                    output.emit("error", err);
                } else {
                    output.end(data);
                }
            });
        }
        return output;
    } else {
        var inputStream = new Transform();
        var inputFilePath = mfs.getTempFilePath() + ".js";

        var buf = new Buffer(0);
        inputStream._transform = function(chunk, enc, done){
            if (chunk) buf = Buffer.concat([buf, chunk]);
            done();
        };
        inputStream._flush = function(done){
            var self = this;
            fs.writeFileSync(inputFilePath, buf);
            getJsdocOutput([ inputFilePath ], options, function(err, data){
                if (err){
                    done(err);
                } else {
                    try {
                        data = applyOptions(data, options);
                        self.push(data);
                        self.push(null)
                        done();
                    } catch(err){
                        done(err);
                    }
                }
                mfs.deleteFile(inputFilePath);
            });
        };
        return inputStream;
    }
}

function OutputTransform(options){
    Transform.call(this);
    this.json = new Buffer(0);
    this._transform = function(chunk, enc, done){
        if (chunk) this.json = Buffer.concat([ this.json, chunk ]);
        done();
    };
    this._flush = function(){
        try {
            this.json = applyOptions(this.json, options);
        } catch(err){
            err.message += " [Problem parsing the JSON data output by jsdoc, input data: " + this.json.toString().substr(0, 100) + "]";
            return this.emit("error", err);
        }
        this.push(this.json);
        this.push(null);
    };
}
util.inherits(OutputTransform, Transform);

/*
Cross-platform. Spawns the command:
`$ ../node_modules/jsdoc-75lb/jsdoc.js --pedantic -t . -c ../conf.json`
Uses `publish.js` as a template and the [`plugins/parseHtml`](https://github.com/arodic/jsdoc/commit/0650ac14f2048f7e6c5968630b58dc4b007498aa) plugin.
*/
function getJsdocOutput(src, options, done){
    var jsdocTemplatePath = path.resolve(__dirname, "..", "lib");
    var args = [
        path.resolve(__dirname, "..", "node_modules", "jsdoc-75lb", "jsdoc.js"),
        "--pedantic",
        "-t",
        jsdocTemplatePath
    ];
    if (options.html){
        args = args.concat([
            "-c",
            path.resolve(__dirname, "conf.json")
        ])
    }
    args = args.concat(src);

    var outputFilePath = mfs.getTempFilePath() + ".json";
    var outputFile = fs.openSync(outputFilePath, "w");
    var handle = cp.spawn("node", args, { stdio: [ process.stdin, outputFile, process.stderr ]});
    handle.on("error", done);
    handle.on("close", function(){
        fs.readFile(outputFilePath, function(err, data){
            done(err, data);
            mfs.deleteFile(outputFilePath);
        });
    });
}

parse.cliOptions = [
    { name: "private", type: Boolean, description: "Include identifiers marked @private in the output" },
    { name: "stats", type: Boolean, description: "Print a few stats about the doclets parsed" },
    { name: "html", type: Boolean, description: "Enable experimental parsing of .html files" },
    { name: "src", type: Array, defaultOption: true, description: "A list of javascript source files or glob expressions" }
];

/**
@param {string} - input json string
@param {object} - jsdoc-parse options
@returns {string} - output json string to be streamed out
@private
*/
function applyOptions(data, options){
    data = JSON.parse(data.toString());
    if(options.stats) {
        var stats = {};
        stats.memberof = a.unique(a.pluck(data, "memberof"));
        stats.class = a.pluck(a.where(data, { kind: "class" }), "longname");
        stats.module = a.pluck(a.where(data, { kind: "module" }), "longname");

        return JSON.stringify(stats, null, "  ");
    } else {
        data = data.filter(function(item){
            if (options.private){
                return item.ignore === undefined;
            } else {
                return item.ignore === undefined && item.access !== "private";
            }
        });
        return JSON.stringify(data, null, "  ");
    }    
}
