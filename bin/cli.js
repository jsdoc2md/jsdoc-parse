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
  console.error(usage)
  process.exit(0)
}

var parseStream = parse(options)
  .on('error', function (err) {
    stop(err.stack, 1)
  })
parseStream.pipe(process.stdout)

if (!options.src) process.stdin.pipe(parseStream)

function stop (msg, code) {
  console.error(ansi.format(msg, 'red'))
  console.error(usage)
  process.exit(code)
}
