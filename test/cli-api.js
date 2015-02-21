"use strict";
var test = require("tape");
var parse = require("../");
var spawn = require("child_process").spawn;
var fs = require("fs");

/* Test the CLI API functions as expected, not interested in correct output here */

try{
    fs.mkdirSync("tmp");
} catch(err){
    // dir exists
}

test("valid json out", function(t){
    t.plan(1);
    var stream = parse("test/fixture/chainable.js");
    stream.on("readable", function(){
        var chunk = this.read();
        if (chunk){
            var data = JSON.parse(chunk);
            t.equal(data[0].name, "Chainable");
        }
    });
});

test("stdin input working", function(t){
    t.plan(1);
    var inputFile = fs.openSync("test/fixture/chainable.js", "r");
    var outputFile = fs.openSync("tmp/jsdoc-parse.json", "w");
    var handle = spawn("node", [ "bin/cli.js"], { stdio: [ inputFile, outputFile, process.stderr ]});
    handle.on("close", function(){
        var json = fs.readFileSync("tmp/jsdoc-parse.json", "utf8");
        var data = JSON.parse(json);
        t.equal(data[0].name, "Chainable");
    });
});

test("glob expression", function(t){
    t.plan(2);
    var stream = parse("lib/*.js");
    stream.on("readable", function(){
        var chunk = this.read();
        if (chunk){
            var data = JSON.parse(chunk);
            t.ok(data[0].name);
            t.ok(data[2].longname);
        }
    });
});
