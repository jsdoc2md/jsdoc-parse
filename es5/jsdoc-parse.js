'use strict';

var sortArray = require('sort-array');
var transform = require('./transform');
var a = require('array-tools');

exports.parse = parse;
exports.getStats = getStats;

function parse(jsdocExplainOutput, options) {
  options = options || {};
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
  var order = {
    kind: ['class', 'constructor', 'mixin', 'member', 'namespace', 'constant', 'function', 'event', 'typedef', 'external'],
    scope: ['global', 'instance', 'static', 'inner']
  };

  if (!sortBy) {
    return array;
  } else {
    return sortArray(array, sortBy, order);
  }
}