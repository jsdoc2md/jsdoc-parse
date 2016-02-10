'use strict'
const sortArray = require('sort-array')
const fileSet = require('file-set')
const Transform = require('stream').Transform
const transform = require('./transform')
const collectJson = require('collect-json')
const assert = require('assert')
const connect = require('stream-connect')
const fs = require('fs')

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
  const data = transform(jsdocExplainOutput)
  // sort or filter out private

  return data
}

/**
 * @param {string} - input json string
 * @param {object} - jsdoc-parse options
 * @returns {string} - output json string to be streamed out
 * @private
 */
function applyOptions (data, options) {
  if (options.stats) {
    return JSON.stringify(getStats(data), null, '  ') + '\n'
  } else {
    data = data.filter(function (item) {
      var parent = data.find(d => d.id === item.memberof) || {}
      if (item.ignore || parent.ignore) {
        return false
      } else if (!options.private && item.access === 'private' || parent.access === 'private') {
        return false
      } else {
        return true
      }
    })

    if (options['sort-by'] && !a(options['sort-by']).contains('none')) {
      data = sort(data, options['sort-by'])
    }
    return JSON.stringify(data, null, '  ') + '\n'
  }
}

/**
 * return some stats about the parsed data
 * @param {object} - jsdoc-parse data
 * @returns {object}
 * @private
 */
function getStats (data) {
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
