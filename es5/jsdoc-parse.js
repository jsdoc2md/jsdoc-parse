'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var util = require('util');
var a = require('array-tools');
var fileSet = require('file-set');
var Transform = require('stream').Transform;
var cliOptions = require('./cli-options');
var jsdoc = require('jsdoc-api');
var transform = require('./transform');
var collectJson = require('collect-json');

module.exports = jsdocParse;
jsdocParse.cliOptions = cliOptions.definitions;

function jsdocParse(options) {
  options = new ParseOptions(options);

  if (options.invalidMessage) {
    var _ret = (function () {
      var output = new Transform();
      process.nextTick(function () {
        output.emit('error', new Error(options.invalidMessage));
      });
      return {
        v: output
      };
    })();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    if (options.src) {
      return jsdoc.createExplainStream(options.fileSet.files).pipe(transform()).pipe(collectJson(function (data) {
        return applyOptions(data, options);
      }));
    }
  }

  return;
}

function OutputTransform(options) {
  Transform.call(this);
  this.json = new Buffer(0);
  this._transform = function (chunk, enc, done) {
    if (chunk) this.json = Buffer.concat([this.json, chunk]);
    done();
  };
  this._flush = function () {
    try {
      this.json = applyOptions(this.json, options);
    } catch (err) {
      err.message += ' [Problem parsing the JSON data output by jsdoc, input data: ' + this.json.toString().substr(0, 100) + ']';
      return this.emit('error', err);
    }
    this.push(this.json);
    this.push(null);
  };
}
util.inherits(OutputTransform, Transform);

function applyOptions(data, options) {
  if (options.stats) {
    return JSON.stringify(getStats(data), null, '  ') + '\n';
  } else {
    data = data.filter(function (item) {
      if (options.private) {
        return item.ignore === undefined;
      } else {
        return item.ignore === undefined && item.access !== 'private';
      }
    });

    if (options['sort-by'] && !a(options['sort-by']).contains('none')) {
      data = sort(data, options['sort-by']);
    }
    return JSON.stringify(data, null, '  ') + '\n';
  }
}

function getStats(data) {
  var stats = {
    identifiers: {}
  };
  var kinds = ['module', 'class', 'constructor', 'mixin', 'member', 'namespace', 'constant', 'function', 'event', 'typedef', 'external'];
  kinds.forEach(function (kind) {
    stats.identifiers[kind] = a(data).where({ kind: kind }).pluck('longname').val();
  });
  return stats;
}

function sort(array, sortBy) {
  var order = {
    kind: ['class', 'constructor', 'mixin', 'member', 'namespace', 'constant', 'function', 'event', 'typedef', 'external'],
    scope: ['global', 'instance', 'static', 'inner']
  };

  if (!sortBy) {
    return array;
  } else {
    return a.sortBy(array, sortBy, order);
  }
}

var ParseOptions = (function () {
  function ParseOptions(options) {
    _classCallCheck(this, ParseOptions);

    this.src = null;

    this.private = false;

    this.stats;

    this.html = false;

    this.conf = null;

    this['sort-by'] = ['scope', 'category', 'kind', 'order'];

    Object.assign(this, options);
    if (this.src) this.fileSet = fileSet(this.src);
  }

  _createClass(ParseOptions, [{
    key: 'invalidMessage',
    get: function get() {
      if (this.src) {
        if (!this.fileSet.files.length) {
          return '[jsdoc-parse] please specify valid input files.';
        } else if (this.fileSet.notExisting && this.fileSet.notExisting.length) {
          return 'These files do not exist: ' + this.fileSet.notExisting.join(', ');
        }
      }
    }
  }]);

  return ParseOptions;
})();