var test = require("tape");
var parse = require("../");

test("valid json out", function(t){
    t.plan(1);
    var stream = parse({ src: "lib/jsdoc-parse.js" });
    stream.on("readable", function(){
        var data = JSON.parse(this.read());
        t.equal(data[0].name, "jsdoc-parse");
    });
});
