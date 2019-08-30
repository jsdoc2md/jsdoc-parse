const Tom = require('test-runner').Tom
const jsdocParse = require('../')
const fs = require('fs')
const a = require('assert')

const tom = module.exports = new Tom('api')

tom.test('api: valid json out', function () {
  const jsdocOutput = JSON.parse(fs.readFileSync('./test/fixture/jsdoc-input.json', 'utf8'))
  const data = jsdocParse(jsdocOutput)
  a.strictEqual(data[0].name, 'Chainable')
})
