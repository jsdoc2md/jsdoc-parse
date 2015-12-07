var detect = require('feature-detect-es6')

if (detect.class() && detect.arrowFunction() && detect.let() && detect.const()) {
  module.exports = require('./lib/jsdoc-parse')
} else {
  module.exports = require('./es5/jsdoc-parse')
}
