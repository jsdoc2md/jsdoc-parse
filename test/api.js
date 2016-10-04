'use strict'
var TestRunner = require('test-runner')
var jsdocParse = require('../')
var fs = require('fs')
var a = require('assert')
var runner = new TestRunner()

runner.test('api: valid json out', function () {
  var jsdocOutput = JSON.parse(fs.readFileSync('./test/fixture/jsdoc-input.json', 'utf8'))
  var data = jsdocParse(jsdocOutput)
  a.strictEqual(data[0].name, 'Chainable')
})
