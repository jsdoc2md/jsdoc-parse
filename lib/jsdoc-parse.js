"use strict";
var cp = require("child_process");
var path = require("path");
var util = require("util");
var a = require("array-tools");
var o = require("object-tools");
var fs = require("fs");
var mfs = require("more-fs");
var fileSet = require("file-set");
var Transform = require("stream").Transform;

/**
Exports a single function to parse jsdoc data.
@module jsdoc-parse
@example
```js
var parse = require("jsdoc-parse");
```
*/
module.exports = jsdocParse;

/**
@class
@classdesc All options for jsdoc-parse, including defaults
*/
function ParseOptions(){
    /**
    * The source files to parse. If this option is not set jsdoc-parse will wait for input to be streamed in.
    * @type {string | string[]}
    * @example
    * var parse = require("jsdoc-parse");
    * var fs = require("fs");
    *
    * // either supply one or more file names
    * parse({ src: "example.js" }).pipe(process.stdout);
    * 
    * // or pipe in source code
    * fs.createReadStream("example.js").parse().pipe(process.stdout);
    */
    this.src = null;
    
    /**
    Include identifier documentation marked as `@private` in the output
    @type {boolean}
    @default
    */
    this.private = false;
    
    /**
    Print a few stats about the doclets parsed
    @type {boolean}
    */
    this.stats;
    
    /**
    Enable experimental parsing of .html files.
    @type {boolean}
    @default
    */
    this.html = false;
    
    /**
    Sort by one of more fields, e.g. `--sort-by kind category`.
    @type {array}
    @default
    */
    this["sort-by"] = [ "scope", "category", "kind", "order" ];
}

/**
Documented javascript source in, documentation JSON out.
@alias module:jsdoc-parse
@param [options] {module:jsdoc-parse~ParseOptions} - parse options
@returns {external:TransformStream}
@example
```js
parse({ src:"lib/jsdoc-parse.js" }).pipe(process.stdout);
```
*/
function jsdocParse(options){
    options = o.extend(new ParseOptions(), options);
    var src = options.src;
    
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
                        self.push(null);
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
        ]);
    }
    args = args.concat(src);

    var outputFilePath = mfs.getTempFilePath() + ".json";
    var outputFile = fs.openSync(outputFilePath, "w");
    var handle = cp.spawn("node", args, { stdio: [ process.stdin, outputFile, process.stderr ]});
    handle.on("error", done);
    handle.on("close", function(){
        fs.readFile(outputFilePath, function(err, data){
            done(err, data);
            fs.unlinkSync(outputFilePath);
        });
    });
}

jsdocParse.cliOptions = [
    { name: "private", type: Boolean, description: "Include identifiers marked @private in the output" },
    { name: "stats", type: Boolean, description: "Print a few stats about the doclets parsed" },
    { name: "html", type: Boolean, description: "Enable experimental parsing of .html files" },
    { name: "src", type: Array, defaultOption: true, description: "A list of javascript source files (or glob expressions) to parse for documentation" },
    { name: "sort-by", type: Array, alias: "s",
      description: "Sort by one of more fields, e.g. `--sort-by kind category`. Defaults to 'scope kind'."
    }
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
        return JSON.stringify(getStats(data), null, "  ") + "\n";
    } else {
        data = data.filter(function(item){
            if (options.private){
                return item.ignore === undefined;
            } else {
                return item.ignore === undefined && item.access !== "private";
            }
        });
        
        if (options["sort-by"]){
            data = sort(data, options["sort-by"]);
        }
        return JSON.stringify(data, null, "  ") + "\n";
    }    
}

/**
return some stats about the parsed data
@param {object} - jsdoc-parse data
@returns {object}
@private
*/
function getStats(data){
    var stats = {
        identifiers: {}
    };
    [ "module", "class", "constructor", "mixin", "member", "namespace", "constant", "function", "event", "typedef", "external" ].forEach(function(kind){
        stats.identifiers[kind] = a(data).where({ kind: kind }).pluck("longname").val();
    });
    return stats;
}

function sort(array, sortBy){
    var order = {
        kind: [ "class", "constructor", "mixin", "member", "namespace", 
            "constant", "function", "event", "typedef", "external" ],
        scope: [ "global", "instance", "static", "inner" ]
    };
    
    if (!sortBy){
        return array;
    } else {
        return a.sortBy(array, sortBy, order);
    }
}

/**
@external TransformStream
@see http://nodejs.org/api/stream.html#stream_class_stream_transform
*/
