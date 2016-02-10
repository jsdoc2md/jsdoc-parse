'use strict';

var sortArray = require('sort-array');
var fileSet = require('file-set');
var Transform = require('stream').Transform;
var transform = require('./transform');
var collectJson = require('collect-json');
var assert = require('assert');
var connect = require('stream-connect');
var fs = require('fs');

exports.parse = parse;
exports.getStats = getStats;

function parse(jsdocExplainOutput, options) {
  var data = transform(jsdocExplainOutput);

  return data;
}

function applyOptions(data, options) {
  if (options.stats) {
    return JSON.stringify(getStats(data), null, '  ') + '\n';
  } else {
    data = data.filter(function (item) {
      var parent = data.find(function (d) {
        return d.id === item.memberof;
      }) || {};
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
    return sortArray(array, sortBy, order);
  }
}