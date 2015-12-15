var detect = require('feature-detect-es6')

if (detect.all('class', 'arrowFunction', 'let', 'const', 'newArrayFeatures' )) {
  module.exports = require('./lib/jsdoc-parse')
} else {
  module.exports = require('./es5/jsdoc-parse')
}
