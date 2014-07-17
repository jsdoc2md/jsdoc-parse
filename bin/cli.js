#!/usr/bin/env node
"use strict";

var parse = require("../");

var files = process.argv.slice(2);
if (files.length){
    parse(files).pipe(process.stdout);
} else {
    process.stdin.pipe(parse()).pipe(process.stdout);
}
