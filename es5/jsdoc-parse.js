'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sortArray = require('sort-array');
var transform = require('./transform');
var a = require('array-tools');
var t = require('typical');

exports.parse = parse;
exports.getStats = getStats;
exports.groupBy = groupBy;

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

  if (options['group-by']) {
    data = groupBy(data, options['group-by']);
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
  var customSortOrders = {
    kind: ['class', 'constructor', 'mixin', 'member', 'namespace', 'enum', 'constant', 'function', 'event', 'typedef', 'external'],
    scope: ['global', 'instance', 'static', 'inner']
  };

  if (!sortBy) {
    return array;
  } else {
    return sortArray(array, sortBy, customSortOrders);
  }
}

function _addGroup(doclets, groupByFields) {
  return doclets.map(function (doclet) {
    doclet._group = groupByFields.map(function (field) {
      return t.isDefined(doclet[field]) ? doclet[field] : null;
    });
    return doclet;
  });
}

function groupBy(doclets, groupByFields) {
  var commonSequence = require('common-sequence');

  groupByFields = groupByFields.slice(0);

  groupByFields.forEach(function (group) {
    var docletGroupValues = doclets.filter(function (doclet) {
      return doclet.kind !== 'constructor';
    }).map(function (d) {
      return d[group];
    });
    var groupValues = a.unique(docletGroupValues);
    if (groupValues.length <= 1) groupByFields = a.without(groupByFields, group);
  });

  doclets = _addGroup(doclets, groupByFields);

  var inserts = [];
  var prevGroup = [];
  doclets.forEach(function (doclet, index) {
    if (!deepEqual(doclet._group, prevGroup)) {
      var common = commonSequence(doclet._group, prevGroup);
      doclet._group.forEach(function (group, i) {
        if (group !== common[i] && group !== null) {
          inserts.push({
            index: index,
            group: group
          });
        }
      });
    }
    prevGroup = doclet._group;
    delete doclet._group;
  });

  inserts.reverse().forEach(function (insert, i) {
    doclets.splice(insert.index, 0, { id: insert.group, kind: 'group', parentId: null });
  });

  var currentGroup = null;
  doclets.forEach(function (d, index) {
    d.parentId = currentGroup;
    if (index === 0) {
      currentGroup = d.id;
    } else {
      if (d.kind === 'group') currentGroup = d.id;
    }
  });

  return doclets;
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