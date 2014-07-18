var cp = require("child_process");
var path = require("path");

var jsdoc = path.join("node_modules", ".bin", "jsdoc");
cp.exec(jsdoc + " -X lib/jsdoc-parse.js", function(err, stdout, stderr){
    console.log("Failed: ", err);
    console.log("stdout: " + stdout.length);
    console.log("stderr: " + stderr.length);

    console.log(stdout);
});

// cp.spawn("jsdoc", [], { stdio: "inherit" });