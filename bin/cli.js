#!/usr/bin/env node
"use strict";
var parse = require("../");
var cliArgs = require("command-line-args");

var cli = cliArgs(parse.cliOptions.concat([
    { name: "help", alias: "h", type: Boolean }
]));

try {
	var usage = cli.getUsage({
	    title: "jsdoc-parse",
        header: "Jsdoc-annotated javascript in, JSON out",
        forms: [
            "$ jsdoc-parse <files>",
            "$ cat <files> | jsdoc-parse"
        ]
	});
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

if (argv.src && argv.src.length){
    var parseStream = parse(argv.src, argv);
    parseStream
        .on("error", console.error)
        .pipe(process.stdout);
} else {
    var parseStream = parse(null, argv);
    parseStream.on("error", console.error);
    process.stdin.pipe(parseStream).pipe(process.stdout);
}
