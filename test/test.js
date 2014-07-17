var test = require("tape");
var parse = require("../");
var spawn = require("child_process").spawn;
var fs = require("fs");

try{
    fs.mkdirSync("tmp");
} catch(err){
    // dir exists
}

test("valid json out", function(t){
    t.plan(1);
    var stream = parse("lib/jsdoc-parse.js");
    stream.on("readable", function(){
        var chunk = this.read();
        if (chunk){
            var data = JSON.parse(chunk);
            t.equal(data[0].name, "jsdoc-parse");
        }
    });
});

test("stdin input working", function(t){
    t.plan(1);
    var inputFile = fs.openSync("lib/jsdoc-parse.js", "r");
    var outputFile = fs.openSync("tmp/jsdoc-parse.json", "w");
    var handle = spawn("jsdoc-parse", [], { stdio: [ inputFile, outputFile, process.stderr ]});
    handle.on("close", function(){
        var data = fs.readFileSync("tmp/jsdoc-parse.json", "utf8");
        t.ok(/longname/.test(data));
    });
});
