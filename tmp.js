var cp = require("child_process");

cp.exec("jsdoc", function(err, stdout, stderr){
	console.log("Failed: ", err);
	console.log("stdout: " + stdout.length);
	console.log("stderr: " + stderr.length);
});
