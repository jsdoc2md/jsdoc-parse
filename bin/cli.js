#!/usr/bin/env node
'use strict'
var parse = require('../')
var commandLineArgs = require('command-line-args')
var cliOptions = require('../lib/cli-options')
var ansi = require('ansi-escape-sequences')

var cli = commandLineArgs(parse.cliOptions.concat([
  { name: 'help', alias: 'h', type: Boolean, description: 'Display this usage.' }
]))

try {
  var usage = cli.getUsage(cliOptions.usage)
  var options = cli.parse()
} catch (err) {
  stop(err.message, 1)
}

if (options.help) {
  console.log(usage)
  process.exit(0)
}

if (options.src && options.src.length) {
  var parseStream = parse(options)
  parseStream
    .on('error', function (err) {
      stop(err.message, 1)
    })
    .pipe(process.stdout)
} else {
  var parseStream = parse(options)
  parseStream.on('error', function (err) {
    stop(err.message, 1)
  })
  process.stdin.pipe(parseStream).pipe(process.stdout)
}

function stop (msg, code) {
  console.error(ansi.format(msg, 'red'))
  console.error(usage)
  process.exit(code)
}
