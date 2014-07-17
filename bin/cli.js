#!/usr/bin/env node
"use strict";

var parse = require("../");

var files = process.argv.slice(2);
if (files.length){
    parse(files).pipe(process.stdout);
} else {
    console.error("no input files specified, listening on stdin...");
    process.stdin.pipe(parse()).pipe(process.stdout);
}
