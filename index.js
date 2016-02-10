var detect = require('feature-detect-es6')

if (detect.all('class', 'arrowFunction', 'let', 'const', 'newArrayFeatures')) {
  module.exports = require('./lib/jsdoc-parse')
} else {
  require('core-js/es6/object')
  require('core-js/es6/array')
  module.exports = require('./es5/jsdoc-parse')
}
