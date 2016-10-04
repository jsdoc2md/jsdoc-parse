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

test('api: conf', function (t) {
  t.plan(1)
  var stream = parse({ src: 'test/fixture/simple.js', conf: 'test/fixture/conf.json' })
  stream.on('readable', function () {
    var chunk = this.read()
    if (chunk) {
      var data = JSON.parse(chunk)
      t.strictEqual(data[0].description, 'A VARIABLE')
    }
  })
})
