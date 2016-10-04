'use strict';

var transform = require('./transform');

module.exports = jsdocParse;

function jsdocParse(jsdocData) {
  var data = transform(jsdocData);
  return sort(data);
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