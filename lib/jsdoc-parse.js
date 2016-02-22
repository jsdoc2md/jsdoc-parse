'use strict'
const sortArray = require('sort-array')
const transform = require('./transform')
const a = require('array-tools')
const t = require('typical')

/**
 *
 * @module jsdoc-parse
 * @example
 * var jsdocParse = require('jsdoc-parse')
 */

exports.parse = parse
exports.getStats = getStats
exports.groupBy = groupBy

/**
 * @param {object[]} - jsdoc output
 * @param [options] {object}
 * @param [options.private] {boolean} - Include identifier documentation marked as `@private` in the output
 * @param [options.html] {boolean} - Enable experimental parsing of .html files.
 * @param [options.sort-by=[ 'scope', 'category', 'kind', 'order' ]] {string[]} - Sort by one of more fields, e.g. `--sort-by kind category`. Pass the special value `none` to remove the default sort order.
 * @param [options.group-by] {string[]}
 */
function parse (jsdocExplainOutput, options) {
  options = new ParseOptions(options)
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

  if (options['group-by']) {
    data = groupBy(data, options['group-by'])
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
  var customOrder = {
    kind: [ 'class', 'constructor', 'mixin', 'member', 'namespace', 'enum',
      'constant', 'function', 'event', 'typedef', 'external' ],
    scope: [ 'global', 'instance', 'static', 'inner' ]
  }

  if (!sortBy) {
    return array
  } else {
    return sortArray(array, sortBy, customOrder)
  }
}

function _addGroup (doclets, groupByFields) {
  return doclets.map(doclet => {
    doclet._group = groupByFields
      .map(field => t.isDefined(doclet[field]) ? doclet[field] : null)
    return doclet
  })
}

/**
 * takes the children of this, groups them, inserts group headings..
 */
function groupBy (doclets, groupByFields) {
  var commonSequence = require('common-sequence')

  /* don't modify the input array */
  groupByFields = groupByFields.slice(0)

  /* remove groupByFields that don't have any values */
  // console.error(groupByFields)
  groupByFields
    .forEach(group => {
      const docletGroupValues = doclets
        .filter(doclet => doclet.kind !== 'constructor')
        .map(d => d[group])
      let groupValues = a.unique(docletGroupValues)
      if (groupValues.length <= 1) groupByFields = a.without(groupByFields, group)
    })
  // console.error(groupByFields)
  doclets = _addGroup(doclets, groupByFields)

  var inserts = []
  var prevGroup = []
  doclets.forEach((doclet, index) => {
    if (!deepEqual(doclet._group, prevGroup)) {
      var common = commonSequence(doclet._group, prevGroup)
      doclet._group.forEach((group, i) => {
        if (group !== common[i] && group !== null) {
          inserts.push({
            index: index,
            group: group
          })
        }
      })
    }
    prevGroup = doclet._group
    delete doclet._group
  })

  /* insert group records */
  inserts.reverse().forEach((insert, i) => {
    // console.error(i, insert)
    doclets.splice(insert.index, 0, { id: insert.group, kind: 'group', parentId: null })
  })

  /* update parentIds for group members */
  let currentGroup = null
  doclets.forEach((d, index) => {
    d.parentId = currentGroup
    if (index === 0) {
      currentGroup = d.id
    } else {
      if (d.kind === 'group') currentGroup = d.id
    }
  })

  return doclets
}

function deepEqual (a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Common jsdoc2md options
 */
class ParseOptions {
  constructor (options) {
    options = options || {}

    this['group-by'] = null

    this['sort-by'] = [ 'scope', 'category', 'kind', 'order' ]

    Object.assign(this, options)
  }
}
