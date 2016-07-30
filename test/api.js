'use strict'
var test = require('test-runner')
var jsdocParse = require('../')
var fs = require('fs')
var a = require('assert')

test('api: valid json out', function (t) {
  var jsdocOutput = JSON.parse(fs.readFileSync('./test/fixture/jsdoc-input.json', 'utf8'))
  var data = jsdocParse(jsdocOutput)
  a.strictEqual(data[0].name, 'Chainable')
})
