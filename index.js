var detect = require('feature-detect-es6')

if (!detect.newArrayFeatures()) {
  require('core-js/es6/array')
}

if (detect.all('class', 'arrowFunction', 'let', 'const')) {
  module.exports = require('./lib/jsdoc-parse')
} else {
  require('core-js/es6/object')
  module.exports = require('./es5/jsdoc-parse')
}
