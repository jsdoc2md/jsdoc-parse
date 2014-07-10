#!/usr/bin/env node
"use strict";

var parse = require("../");

parse({ src: process.argv.slice(2) }).pipe(process.stdout);