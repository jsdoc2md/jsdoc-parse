'use strict';

var transform = require('./transform');

exports.parse = parse;

function parse(jsdocData, options) {
  options = options || {};
  var data = transform(jsdocData);

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

  return data;
}