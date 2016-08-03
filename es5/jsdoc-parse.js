'use strict';

var transform = require('./transform');

module.exports = parse;

function parse(jsdocData, options) {
  options = options || {};
  var data = transform(jsdocData);

  data = sort(data, options['sort-by']);
  return data;
}

function sort(array, properties) {
  var sortBy = require('sort-array');
  var customOrder = {
    kind: ['class', 'constructor', 'mixin', 'member', 'namespace', 'enum', 'constant', 'function', 'event', 'typedef', 'external'],
    scope: ['global', 'instance', 'static', 'inner']
  };
  properties = properties || ['scope', 'category', 'kind', 'order'];
  return sortBy(array, properties, customOrder);
}