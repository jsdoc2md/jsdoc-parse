var test = require("tape");
var parse = require("../");

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
