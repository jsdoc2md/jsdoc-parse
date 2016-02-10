'use strict'
const sortArray = require('sort-array')
const transform = require('./transform')
const a = require('array-tools')

/**
 *
 * @module jsdoc-parse
 * @example
 * var jsdocParse = require('jsdoc-parse')
 */

exports.parse = parse
exports.getStats = getStats

/**
 * @param {object[]} - jsdoc output
 * @param [options] {object}
 * @param [options.private] {boolean} - Include identifier documentation marked as `@private` in the output
 * @param [options.html] {boolean} - Enable experimental parsing of .html files.
 * @param [options.sort-by=[ 'scope', 'category', 'kind', 'order' ]] {string[]} - Sort by one of more fields, e.g. `--sort-by kind category`. Pass the special value `none` to remove the default sort order.
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

  if (options['sort-by'] && !a(options['sort-by']).contains('none')) {
    data = sort(data, options['sort-by'])
  } else if (!options['sort-by']) {
    data = sort(data, [ 'scope', 'category', 'kind', 'order' ])
  }

  return data
}

/**
 * return some stats about the parsed data
 * @param {object} - jsdoc-parse data
 * @returns {object}
 * @private
 */
function getStats (jsdocExplainOutput) {
  const data = parse(jsdocExplainOutput)
  var stats = {
    identifiers: {}
  }
  var kinds = [
    'module', 'class', 'constructor', 'mixin', 'member',
    'namespace', 'constant', 'function', 'event', 'typedef', 'external'
  ]
  kinds.forEach(function (kind) {
    stats.identifiers[kind] = a(data).where({ kind: kind }).pluck('longname').val()
  })
  return stats
}

function sort (array, sortBy) {
  var order = {
    kind: [ 'class', 'constructor', 'mixin', 'member', 'namespace',
      'constant', 'function', 'event', 'typedef', 'external' ],
    scope: [ 'global', 'instance', 'static', 'inner' ]
  }

  if (!sortBy) {
    return array
  } else {
    return sortArray(array, sortBy, order)
  }
}
