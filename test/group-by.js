'use strict'
var test = require('tape')
var jsdocParse = require('../')

test('groupBy', function (t) {
  const fixture = require('./fixture/deep-class')
  console.log(jsdocParse.groupBy(fixture, [ 'scope', 'category' ]))
  t.end()
})

test.only('groupBy2', function (t) {
  const fixture = require('./fixture/deep-class')
  console.log(jsdocParse.groupBy(fixture, [ 'scope' ]))
  t.end()
})
