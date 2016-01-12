'use strict'
var test = require('tape')
var parse = require('../')
var fs = require('fs')

test('api: valid json out', function (t) {
  t.plan(1)
  var stream = parse()
  stream.on('readable', function () {
    var chunk = this.read()
    if (chunk) {
      var data = JSON.parse(chunk)
      t.equal(data[0].name, 'Chainable')
    }
  })
  fs.createReadStream('./test/fixture/jsdoc-input.json').pipe(stream)
})

test('api: glob expression', function (t) {
  t.plan(2)
  var stream = parse({ src: 'test/fixture/*.json' })
  stream.on('readable', function () {
    var chunk = this.read()
    if (chunk) {
      var data = JSON.parse(chunk)
      t.ok(data[0].name)
      t.ok(data[0].longname)
    }
  })
})
