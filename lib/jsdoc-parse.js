'use strict'
const transform = require('./transform')

/**
 * @module jsdoc-parse
 * @example
 * const jsdocParse = require('jsdoc-parse')
 */
module.exports = parse

/**
 * @param {object[]} - jsdoc output
 * @param [options] {object}
 * @param [options.sort-by] {string|string[]} - Sort by one of more properties, e.g. `[ 'kind', 'category' ]`. Defaults to `[ 'scope', 'category', 'kind', 'order' ]`.
 * @returns {object[]}
 * @alias module:jsdoc-parse
 */
function parse (jsdocData, options) {
  options = options || {}
  let data = transform(jsdocData)

  /* sort */
  data = sort(data, options['sort-by'])
  return data
}

function sort (array, properties) {
  const sortBy = require('sort-array')
  const customOrder = {
    kind: [ 'class', 'constructor', 'mixin', 'member', 'namespace', 'enum', 'constant', 'function', 'event', 'typedef', 'external' ],
    scope: [ 'global', 'instance', 'static', 'inner' ]
  }
  properties = properties || [ 'scope', 'category', 'kind', 'order' ]
  return sortBy(array, properties, customOrder)
}
