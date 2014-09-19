#!/usr/bin/env node
"use strict";

var parse = require("../");

var files = process.argv.slice(2);
if (files.length){
    var parseStream = parse(files);
    parseStream
        .on("error", console.error)
        .pipe(process.stdout);
} else {
    var parseStream = parse();
    parseStream.on("error", console.error);
    process.stdin.pipe(parseStream).pipe(process.stdout);
}
