var cp = require("child_process");

cp.exec("./node_modules/.bin/jsdoc lib/jsdoc-parse.js", function(err, stdout, stderr){
    console.log("Failed: ", err);
    console.log("stdout: " + stdout.length);
    console.log("stderr: " + stderr.length);

    console.log(stdout);
});

// cp.spawn("jsdoc", [], { stdio: "inherit" });