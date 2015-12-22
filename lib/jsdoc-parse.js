'use strict'
const util = require('util')
const path = require('path')
const a = require('array-tools')
const fileSet = require('file-set')
const Transform = require('stream').Transform
const cliOptions = require('./cli-options')
const jsdoc = require('jsdoc-api')
const transform = require('./transform')
const collectJson = require('collect-json')

/**
 * Exports a single function to parse jsdoc data.
 * @module jsdoc-parse
 * @example
 * ```js
 * var parse = require("jsdoc-parse")
 * ```
 */
module.exports = jsdocParse
jsdocParse.cliOptions = cliOptions.definitions

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
function jsdocParse (options) {
  options = new ParseOptions(options)

  if (options.invalidMessage) {
    const output = new Transform()
    process.nextTick(function () {
      output.emit('error', new Error(options.invalidMessage))
    })
    return output
  } else {
    if (options.src) {
      const jsdocOptions = {}
      if (options.html) jsdocOptions.configure = path.resolve(__dirname, 'html-conf.json')
      const output = jsdoc.createExplainStream(options.fileSet.files, jsdocOptions)
        .on('error', (err => output.emit('error', err)))
        .pipe(transform())
        .on('error', (err => output.emit('error', err)))
        .pipe(collectJson(function (data) {
          return applyOptions(data, options)
        }))
      return output
    }
  }

  return
  // if (src) {
  //   var inputFiles = fileSet(src)
  //   src = inputFiles.files
  //
  //   var output = new OutputTransform(options)
  //
  //   if (!src.length) {
  //     var msg = util.format('[jsdoc-parse] please specify valid input files. ')
  //     if (inputFiles.notExisting) {
  //       msg += 'These files do not exist: ' + inputFiles.notExisting.join(', ')
  //     }
  //     /* defer, to give client chance to attach listener */
  //     process.nextTick(function () {
  //       output.emit('error', new Error(msg))
  //     })
  //   } else {
  //     getJsdocOutput(src, options, function (err, data) {
  //       if (err) {
  //         output.emit('error', err)
  //       } else {
  //         output.end(data)
  //       }
  //     })
  //   }
  //   return output
  // } else {
  //   var inputStream = new Transform()
  //   var inputFilePath = tempPath()
  //
  //   var buf = new Buffer(0)
  //   inputStream._transform = function (chunk, enc, done) {
  //     if (chunk) buf = Buffer.concat([buf, chunk])
  //     done()
  //   }
  //   inputStream._flush = function (done) {
  //     var self = this
  //     fs.writeFileSync(inputFilePath, buf)
  //     getJsdocOutput([ inputFilePath ], options, function (err, data) {
  //       if (err) {
  //         done(err)
  //       } else {
  //         try {
  //           data = applyOptions(data, options)
  //           self.push(data)
  //           self.push(null)
  //           done()
  //         } catch (err) {
  //           done(err)
  //         }
  //       }
  //       fs.unlinkSync(inputFilePath)
  //     })
  //   }
  //   return inputStream
  // }
}

function OutputTransform (options) {
  Transform.call(this)
  this.json = new Buffer(0)
  this._transform = function (chunk, enc, done) {
    if (chunk) this.json = Buffer.concat([ this.json, chunk ])
    done()
  }
  this._flush = function () {
    try {
      this.json = applyOptions(this.json, options)
    } catch (err) {
      err.message += ' [Problem parsing the JSON data output by jsdoc, input data: ' + this.json.toString().substr(0, 100) + ']'
      return this.emit('error', err)
    }
    this.push(this.json)
    this.push(null)
  }
}
util.inherits(OutputTransform, Transform)

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
      if (options.private) {
        return item.ignore === undefined
      } else {
        return item.ignore === undefined && item.access !== 'private'
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
     * A list of javascript source files (or glob expressions) to parse for documentation. If this option is not set jsdoc-parse will wait for source code on stdin (i.e. `cat *.js | jsdoc-parse <options>`).
     * @type {string | string[]}
     * @example
     * var parse = require("jsdoc-parse")
     * var fs = require("fs")
     *
     * // either supply one or more file names
     * parse({ src: "example.js" }).pipe(process.stdout)
     *
     * // or pipe in source code
     * fs.createReadStream("example.js").parse().pipe(process.stdout)
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
     * Path to a jsdoc configuration file, passed directly to `jsdoc -c`.
     * @type {boolean}
     * @default
     */
    this.conf = null

    /**
     * Sort by one of more fields, e.g. `--sort-by kind category`. Pass the special value `none` to remove the default sort order.
     * @type {array}
     * @default
     */
    this['sort-by'] = [ 'scope', 'category', 'kind', 'order' ]

    Object.assign(this, options)
    if (this.src) this.fileSet = fileSet(this.src)
  }

  get invalidMessage () {
    if (this.src) {
      if (!this.fileSet.files.length) {
        return '[jsdoc-parse] please specify valid input files.'
      } else if (this.fileSet.notExisting && this.fileSet.notExisting.length) {
        return 'These files do not exist: ' + this.fileSet.notExisting.join(', ')
      }
    }
  }
}

/**
 * @external TransformStream
 * @see http://nodejs.org/api/stream.html#stream_class_stream_transform
 */
