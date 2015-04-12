"use strict";
var test = require("tape");
var parse = require("../");

test("valid json out", function(t){
    t.plan(1);
    var stream = parse({ src:"test/fixture/chainable.js" });
    stream.on("readable", function(){
        var chunk = this.read();
        if (chunk){
            var data = JSON.parse(chunk);
            t.equal(data[0].name, "Chainable");
        }
    });
});

test("glob expression", function(t){
    t.plan(2);
    var stream = parse({ src: "lib/*.js" });
    stream.on("readable", function(){
        var chunk = this.read();
        if (chunk){
            var data = JSON.parse(chunk);
            t.ok(data[0].name);
            t.ok(data[2].longname);
        }
    });
});
