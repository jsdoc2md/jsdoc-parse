var detect = require('feature-detect-es6')

if (!detect.newArrayFeatures()) {
  require('core-js/es6/array')
}

if (!Object.assign) {
  require('core-js/es6/object')
}

if (detect.all('class', 'arrowFunction', 'let', 'const')) {
  module.exports = require('./lib/jsdoc-parse')
} else {
  module.exports = require('./es5/jsdoc-parse')
}
