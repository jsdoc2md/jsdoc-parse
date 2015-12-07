#!/usr/bin/env node
'use strict'
var parse = require('../')
var commandLineArgs = require('command-line-args')
var cliOptions = require('../lib/cli-options')

var cli = commandLineArgs(parse.cliOptions.concat([
  { name: 'help', alias: 'h', type: Boolean, description: 'Display this usage.' }
]))

try {
  var usage = cli.getUsage(cliOptions.usage)
  var options = cli.parse()
} catch (err) {
  console.log(err.message)
  console.log(usage)
  process.exit(1)
}

if (options.help) {
  console.log(usage)
  process.exit(0)
}

if (options.src && options.src.length) {
  var parseStream = parse(options)
  parseStream
    .on('error', console.error)
    .pipe(process.stdout)
} else {
  var parseStream = parse(options)
  parseStream.on('error', console.error)
  process.stdin.pipe(parseStream).pipe(process.stdout)
}
