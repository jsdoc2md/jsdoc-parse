'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var a = require('array-tools');
var fileSet = require('file-set');
var Transform = require('stream').Transform;
var transform = require('./transform');
var collectJson = require('collect-json');
var assert = require('assert');
var connect = require('stream-connect');
var fs = require('fs');

module.exports = jsdocParse;

function jsdocParse(options) {
  options = new ParseOptions(options);
  var jsdocInput = undefined;
  try {
    var _ret = function () {
      options.validate();

      var outputStream = collectJson(function (data) {
        return applyOptions(data, options);
      });
      var transformStream = connect(transform(), outputStream);

      if (options.src && options.files.length) {
        jsdocInput = concatJsonFileArrays(options.files);
        process.nextTick(function () {
          transformStream.end(JSON.stringify(jsdocInput));
        });
      }
      return {
        v: transformStream
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (err) {
    var _ret2 = function () {
      var output = new Transform();
      process.nextTick(function () {
        output.emit('error', err);
      });
      return {
        v: output
      };
    }();

    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
  }
}

function concatJsonFileArrays(files) {
  return files.reduce(function (prev, curr) {
    var fileContent = fs.readFileSync(curr, 'utf8');
    try {
      var data = JSON.parse(fileContent);
      return prev.concat(data);
    } catch (err) {
      err.message += ' input: ' + fileContent;
      throw err;
    }
  }, []);
}

function applyOptions(data, options) {
  if (options.stats) {
    return JSON.stringify(getStats(data), null, '  ') + '\n';
  } else {
    data = data.filter(function (item) {
      var parent = a.findWhere(data, { id: item.memberof }) || {};
      if (item.ignore || parent.ignore) {
        return false;
      } else if (!options.private && item.access === 'private' || parent.access === 'private') {
        return false;
      } else {
        return true;
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

var ParseOptions = function () {
  function ParseOptions(options) {
    _classCallCheck(this, ParseOptions);

    this.src = null;

    this.private = false;

    this.stats;

    this.html = false;

    this['sort-by'] = ['scope', 'category', 'kind', 'order'];

    Object.assign(this, options);
    if (this.src) {
      this.fileSet = fileSet(this.src);
      this.files = this.fileSet.files;
    }
  }

  _createClass(ParseOptions, [{
    key: 'validate',
    value: function validate() {
      if (this.src) {
        assert.ok(this.fileSet.files.length, 'Please specify valid input files.');
        assert.ok(!(this.fileSet.notExisting && this.fileSet.notExisting.length), 'These files do not exist: ' + this.fileSet.notExisting.join(', '));
      }
    }
  }]);

  return ParseOptions;
}();