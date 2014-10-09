#!/usr/bin/env node
"use strict";

var parse = require("../");
var cliArgs = require("command-line-args");

var cli = cliArgs([
    { name: "private", type: Boolean },
    { name: "files", type: Array, defaultOption: true }
]);

var argv = cli.parse();

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
