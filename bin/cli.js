#!/usr/bin/env node
"use strict";

var parse = require("../");
var cliArgs = require("command-line-args");

var cli = cliArgs(parse.cliOptions);

try {
	var usage = cli.getUsage();
	var argv = cli.parse();
} catch (err){
	console.log(err.message);
	console.log(usage);
	process.exit(1);
}

if (argv.help){
	console.log(usage);
	process.exit(0);	
}

if (argv.files && argv.files.length){
    var parseStream = parse(argv.files, argv);
    parseStream
        .on("error", console.error)
        .pipe(process.stdout);
} else {
    var parseStream = parse(null, argv);
    parseStream.on("error", console.error);
    process.stdin.pipe(parseStream).pipe(process.stdout);
}
