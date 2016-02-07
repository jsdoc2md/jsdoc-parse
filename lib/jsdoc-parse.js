'use strict'
const a = require('array-tools')
const fileSet = require('file-set')
const Transform = require('stream').Transform
const transform = require('./transform')
const collectJson = require('collect-json')
const assert = require('assert')
const connect = require('stream-connect')
const fs = require('fs')

/**
 * Exports a single function to parse jsdoc data.
 * @module jsdoc-parse
 * @example
 * ```js
 * var parse = require("jsdoc-parse")
 * ```
 */
exports.createParseStream = createParseStream
exports.parse = parse
exports.getStats = getStats
exports.loadFiles = loadFiles

function loadFiles (src) {
  const files = fileSet(src).files
  return concatJsonFileArrays(files)
}

function parse (jsdocExplainOutput, options) {
  const data = transform(jsdocExplainOutput)
  // sort or filter out private

  return data
}

/**
 * Documented javascript source in, documentation JSON out.
 * @alias module:jsdoc-parse
 * @param [options] {module:jsdoc-parse~ParseOptions} - parse options
 * @returns {external:TransformStream}
 * @example
 * ```js
 * parse({ src:"lib/jsdoc-parse.js" }).pipe(process.stdout)
 * ```
 */
function createParseStream (options) {
  options = new ParseOptions(options)
  let jsdocInput
  try {
    options.validate()

    const outputStream = collectJson(data => applyOptions(data, options))
    const transformStream = connect(transform(), outputStream)

    if (options.src && options.files.length) {
      jsdocInput = concatJsonFileArrays(options.files)
      process.nextTick(() => {
        transformStream.end(JSON.stringify(jsdocInput))
      })
    }
    return transformStream
  } catch (err) {
    const output = new Transform()
    process.nextTick(() => {
      output.emit('error', err)
    })
    return output
  }
}

function concatJsonFileArrays (files) {
  return files.reduce((prev, curr) => {
    const fileContent = fs.readFileSync(curr, 'utf8')
    try {
      const data = JSON.parse(fileContent)
      return prev.concat(data)
    } catch (err) {
      err.message += ' input: ' + fileContent
      throw err
    }
  }, [])
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
      var parent = a.findWhere(data, { id: item.memberof }) || {}
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
    return a.sortBy(array, sortBy, order)
  }
}

/**
 * All options for jsdoc-parse, including defaults
 */
class ParseOptions {
  constructor (options) {
    /**
     * A list of jsdoc explain files (or glob expressions) to parse for documentation. If this option is not set jsdoc-parse will wait for source code on stdin (i.e. `cat *.json | jsdoc-parse <options>`).
     * @type {string | string[]}
     * @example
     * var parse = require("jsdoc-parse")
     * var fs = require("fs")
     *
     * // either supply one or more file names
     * parse({ src: "example.json" }).pipe(process.stdout)
     *
     * // or pipe in source code
     * fs.createReadStream("example.json").parse().pipe(process.stdout)
     */
    this.src = null

    /**
     * Include identifier documentation marked as `@private` in the output
     * @type {boolean}
     * @default
     */
    this.private = false

    /**
     * Print a few stats about the doclets parsed
     * @type {boolean}
     */
    this.stats

    /**
     * Enable experimental parsing of .html files.
     * @type {boolean}
     * @default
     */
    this.html = false

    /**
     * Sort by one of more fields, e.g. `--sort-by kind category`. Pass the special value `none` to remove the default sort order.
     * @type {array}
     * @default
     */
    this['sort-by'] = [ 'scope', 'category', 'kind', 'order' ]

    Object.assign(this, options)
    if (this.src) {
      this.fileSet = fileSet(this.src)
      this.files = this.fileSet.files
    }
  }

  validate () {
    if (this.src) {
      assert.ok(
        this.fileSet.files.length,
        'Please specify valid input files.'
      )
      assert.ok(
        !(this.fileSet.notExisting && this.fileSet.notExisting.length),
        'These files do not exist: ' + this.fileSet.notExisting.join(', ')
      )
    }
  }
}
