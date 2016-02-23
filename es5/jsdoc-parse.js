'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sortArray = require('sort-array');
var transform = require('./transform');
var a = require('array-tools');
var t = require('typical');

exports.parse = parse;
exports.getStats = getStats;

function parse(jsdocExplainOutput, options) {
  options = new ParseOptions(options);
  var data = transform(jsdocExplainOutput);

  data = data.filter(function (doclet) {
    var parent = data.find(function (d) {
      return d.id === doclet.memberof;
    }) || {};
    if (doclet.ignore || parent.ignore) {
      return false;
    } else if (!options.private && (doclet.access === 'private' || parent.access === 'private')) {
      return false;
    } else {
      return true;
    }
  });

  if (options['sort-by'] && !a(options['sort-by']).contains('none')) {
    data = sort(data, options['sort-by']);
  } else if (!options['sort-by']) {
    data = sort(data, ['scope', 'category', 'kind', 'order']);
  }

  return data;
}

function getStats(jsdocExplainOutput) {
  var data = parse(jsdocExplainOutput);
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
  var customOrder = {
    kind: ['class', 'constructor', 'mixin', 'member', 'namespace', 'enum', 'constant', 'function', 'event', 'typedef', 'external'],
    scope: ['global', 'instance', 'static', 'inner']
  };

  if (!sortBy) {
    return array;
  } else {
    return sortArray(array, sortBy, customOrder);
  }
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

var ParseOptions = function ParseOptions(options) {
  _classCallCheck(this, ParseOptions);

  options = options || {};

  this['group-by'] = null;

  this['sort-by'] = ['scope', 'category', 'kind', 'order'];

  Object.assign(this, options);
};