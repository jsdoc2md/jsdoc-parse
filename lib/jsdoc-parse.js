'use strict'
const transform = require('./transform')

/**
 *
 * @module jsdoc-parse
 * @example
 * var jsdocParse = require('jsdoc-parse')
 */

exports.parse = parse

/**
 * @param {object[]} - jsdoc output
 * @param [options] {object}
 * @param [options.private] {boolean} - Include identifier documentation marked as `@private` in the output
 */
function parse (jsdocExplainOutput, options) {
  options = options || {}
  let data = transform(jsdocExplainOutput)

  data = data.filter(function (doclet) {
    var parent = data.find(d => d.id === doclet.memberof) || {}
    if (doclet.ignore || parent.ignore) {
      return false
    } else if (!options.private && (doclet.access === 'private' || parent.access === 'private')) {
      return false
    } else {
      return true
    }
  })

  return data
}
