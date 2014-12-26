#!/usr/bin/env node
"use strict";

var parse = require("../");

var files = process.argv.slice(2);
if (files.length){
    parse(files)
        .on("error", function(err){
            console.error("ERROR: ", err);
            process.exit(1);
        })
        .pipe(process.stdout);
} else {
    process.stdin
        .pipe(parse())
        .on("error", function(err){
            console.error("ERROR: ", err);
            process.exit(1);
        })
        .pipe(process.stdout);
}
