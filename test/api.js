'use strict'
var test = require('tape')
var jsdocParse = require('../')
var fs = require('fs')

test('api: valid json out', function (t) {
  t.plan(1)
  var jsdocOutput = JSON.parse(fs.readFileSync('./test/fixture/jsdoc-input.json', 'utf8'))
  var data = jsdocParse(jsdocOutput)
  t.equal(data[0].name, 'Chainable')
})
