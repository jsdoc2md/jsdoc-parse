'use strict';

var testValue = require('test-value');
var where = testValue.where;
var arrayify = require('array-back');
var extract = require('reduce-extract');
var pick = require('lodash.pick');
var omit = require('lodash.omit');

module.exports = transform;

function transform(data) {
  data = fixES6ConstructorMemberLongnames(data);

  var json = data.filter(function (i) {
    return !i.undocumented && !/package|file/.test(i.kind);
  });

  json = json.map(setIsExportedFlag);
  json = json.map(setCodename);
  json = insertConstructors(json);

  json = json.map(function (doclet) {
    doclet = setID(doclet);

    doclet = removeQuotes(doclet);
    doclet = cleanProperties(doclet);
    doclet = buildTodoList(doclet);
    doclet = extractTypicalName(doclet);
    doclet = extractCategory(doclet);
    doclet = extractChainable(doclet);
    doclet = extractCustomTags(doclet);
    doclet = setTypedefScope(doclet);
    doclet = renameThisProperty(doclet);
    doclet = removeMemberofFromModule(doclet);
    doclet = convertIsEnumFlagToKind(doclet);
    return doclet;
  });

  var exported = json.filter(where({ isExported: true }));
  var newIDs = exported.map(function (d) {
    return d.id;
  });

  newIDs.forEach(function (newID) {
    update(json, { isExported: undefined, '!kind': 'module' }, function (doclet) {
      return updateIDReferences(doclet, newID);
    });
  });

  json = removeEnumChildren(json);
  json = json.map(removeUnwanted);
  json = json.map(sortIdentifier);

  json.forEach(function (doclet, index) {
    doclet.order = index;
  });

  return json;
}

function setID(doclet) {
  if (doclet.longname) {
    doclet.id = doclet.longname;
  }
  if (doclet.kind === 'constructor') {
    if (doclet.scope === 'static') {
      doclet.id = doclet.longname;
      delete doclet.scope;
    } else {
      doclet.id = doclet.longname + '()';
    }
  }
  if (doclet.isExported) {
    doclet.id = doclet.longname + '--' + doclet.codeName;
  }
  return doclet;
}

function setParentID(doclet) {
  doclet.parentId = doclet.memberof;
  return doclet;
}

function setCodename(doclet) {
  if (doclet.meta && doclet.meta.code) {
    doclet.codeName = doclet.meta.code.name;
    if (doclet.isExported) doclet.name = doclet.codeName;
  }
  return doclet;
}

function setIsExportedFlag(doclet) {
  if (/module:/.test(doclet.name) && doclet.kind !== 'module' && doclet.kind !== 'constructor') {
    doclet.isExported = true;
    doclet.memberof = doclet.longname;
  }
  return doclet;
}

function createConstructor(class_) {
  if (class_.kind !== 'class') {
    throw new Error('should only pass a class to createConstructor');
  }

  var replacements = [];
  class_ = Object.assign({}, class_);
  var constructorProperties = ['description', 'params', 'examples', 'returns', 'exceptions'];
  var constructor = pick(class_, constructorProperties);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = constructorProperties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var prop = _step.value;
      delete class_[prop];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  if (class_.classdesc) {
    class_.description = class_.classdesc;
    delete class_.classdesc;
  }
  replacements.push(class_);

  if (constructor.description || constructor.params && constructor.params.length) {
    constructor.id = class_.id;
    constructor.longname = class_.longname;
    constructor.name = class_.codeName || class_.name;
    constructor.kind = 'constructor';
    constructor.memberof = class_.longname;
    replacements.push(constructor);
  }
  return replacements;
}

function insertConstructors(data) {
  var replacements = [];

  data.forEach(function (doclet, index) {
    if (doclet.kind === 'class') {
      replacements.push({ index: index, items: createConstructor(doclet) });
    }
  });

  replacements.reverse().forEach(function (replacement) {
    var spliceArgs = [replacement.index, 1].concat(replacement.items);
    data.splice.apply(data, spliceArgs);
  });

  return data;
}

function getEs6Constructor(data, parent) {
  return data.find(function (i) {
    return isES6Constructor(i) && i.memberof === parent.longname;
  });
}
function isES5Class(doclet) {
  return testValue(doclet, {
    kind: 'class',
    meta: { code: { type: 'FunctionDeclaration' } }
  });
}
function isES6Class(doclet) {
  return testValue(doclet, {
    kind: 'class',
    meta: { code: { type: 'ClassDeclaration' } }
  });
}
function isES6Constructor(doclet) {
  return testValue(doclet, {
    kind: 'class',
    meta: { code: { type: 'MethodDefinition' } }
  });
}

function replaceID(id, oldID, newID) {
  return id.replace(new RegExp('' + oldID), newID);
}

function updateIDReferences(doclet, newID) {
  var oldID = newID.split('--')[0];
  if (oldID && !doclet.isExported) {
    if (doclet.id) doclet.id = replaceID(doclet.id, oldID, newID);
    if (doclet.memberof) doclet.memberof = replaceID(doclet.memberof, oldID, newID);
    if (doclet.name) doclet.name = replaceID(doclet.name, oldID, newID);
    if (doclet.type && doclet.type.names) {
      doclet.type.names = doclet.type.names.map(function (id) {
        return replaceID(id, oldID, newID);
      });
    }
    if (doclet.returns) {
      doclet.returns = doclet.returns.map(function (doclet) {
        if (doclet.type && doclet.type.names) {
          doclet.type.names = doclet.type.names.map(function (id) {
            return replaceID(id, oldID, newID);
          });
        }
        return doclet;
      });
    }
  }
  return doclet;
}

function removeQuotes(doclet) {
  var re = /["']/g;
  if (doclet.name) doclet.name = doclet.name.replace(re, '');
  if (doclet.memberof) doclet.memberof = doclet.memberof.replace(re, '');
  if (doclet.longname) doclet.longname = doclet.longname.replace(re, '');
  if (doclet.id) doclet.id = doclet.id.replace(re, '');
  return doclet;
}

function removeUnwanted(doclet) {
  delete doclet.todo;
  delete doclet.tags;
  delete doclet.codeName;

  delete doclet.comment;
  delete doclet.undocumented;
  delete doclet.___id;
  delete doclet.___s;

  if (doclet.meta) {
    var oldMeta = doclet.meta;
    doclet.meta = {
      lineno: oldMeta.lineno,
      filename: oldMeta.filename,
      path: oldMeta.path
    };
  }

  return doclet;
}

function cleanProperties(doclet) {
  if (doclet.properties) {
    doclet.properties = doclet.properties.map(function (prop) {
      return wantedProperties(prop);
    });
  }
  return doclet;
}

function wantedProperties(input) {
  return omit(input, ['comment', 'meta', 'undocumented', '___id', '___s']);
}

function buildTodoList(doclet) {
  var todoList = [];
  if (doclet.todo) {
    var todo = arrayify(doclet.todo);
    todoList = todoList.concat(todo.map(function (task) {
      return { done: false, task: task };
    }));
  }

  if (doclet.tags) {
    var done = doclet.tags.reduce(extract({ title: 'done' }), []);
    if (!doclet.tags.length) delete doclet.tags;
    todoList = todoList.concat(done.map(function (task) {
      return { done: true, task: task.value };
    }));
  }

  if (todoList.length) {
    doclet.todoList = todoList;
  }
  return doclet;
}

function extractTypicalName(doclet) {
  if (doclet.tags) {
    var typicalName = doclet.tags.reduce(extract({ title: 'typicalname' }), []);
    if (typicalName.length) doclet.typicalname = typicalName[0].value;
  }
  return doclet;
}

function extractCategory(doclet) {
  if (doclet.tags) {
    var category = doclet.tags.reduce(extract({ title: 'category' }), []);
    if (category.length) doclet.category = category[0].value;
  }
  return doclet;
}

function extractChainable(doclet) {
  if (doclet.tags) {
    var chainable = doclet.tags.reduce(extract({ title: 'chainable' }), []);
    if (chainable.length) doclet.chainable = true;
  }
  return doclet;
}

function extractCustomTags(doclet) {
  if (doclet.tags && doclet.tags.length > 0) {
    doclet.customTags = doclet.tags.map(function (tag) {
      return {
        tag: tag.title,
        value: tag.value
      };
    });
  }
  return doclet;
}

function setTypedefScope(doclet) {
  if (doclet.kind === 'typedef' && !doclet.scope) doclet.scope = 'global';
  return doclet;
}

function sort(object, sortFunction) {
  var output = {};
  var newPropertyOrder = Object.keys(object).filter(function (prop) {
    return typeof object[prop] !== 'function';
  }).sort(sortFunction);
  newPropertyOrder.forEach(function (prop) {
    output[prop] = object[prop];
  });
  return output;
}

function sortIdentifier(doclet) {
  var fieldOrder = ['id', 'parentId', 'longname', 'name', 'kind', 'scope', 'isExported', 'classdesc', 'augments', 'inherits', 'inherited', 'implements', 'overrides', 'mixes', 'description', 'memberof', 'alias', 'params', 'fires', 'examples', 'returns', 'type', 'defaultvalue', 'readonly', 'thisvalue', 'isEnum', 'properties', 'optional', 'nullable', 'variable', 'author', 'deprecated', 'ignore', 'access', 'requires', 'version', 'since', 'licenses', 'license', 'typicalname', 'category', 'see', 'exceptions', 'codeName', 'todoList', 'customTags', 'chainable', 'meta', 'order'];
  return sort(doclet, function (a, b) {
    if (fieldOrder.indexOf(a) === -1 && fieldOrder.indexOf(b) > -1) {
      return 1;
    } else {
      return fieldOrder.indexOf(a) - fieldOrder.indexOf(b);
    }
  });
}

function update(array, query, newValues) {
  for (var i = 0; i < array.length; i++) {
    if (testValue(array[i], query)) {
      var values = typeof newValues === 'function' ? newValues(array[i]) : newValues;
      for (var prop in values) {
        if (values[prop] !== undefined) array[i][prop] = values[prop];
      }
    }
  }
}

function renameThisProperty(doclet) {
  doclet.thisvalue = doclet.this;
  delete doclet.this;
  return doclet;
}

function removeMemberofFromModule(doclet) {
  if (doclet.kind === 'module') {
    delete doclet.memberof;
    delete doclet.scope;
  }
  return doclet;
}

function fixES6ConstructorMemberLongnames(data) {
  data.forEach(function (i) {
    if (isES6Class(i)) {
      var es6constructor = getEs6Constructor(data, i);
      if (es6constructor) {
        var constructorChildren = data.filter(where({ memberof: es6constructor.longname }));
        constructorChildren.forEach(function (child) {
          return child.memberof = i.longname;
        });
      }
    }
  });
  return data;
}

function convertIsEnumFlagToKind(doclet) {
  if (doclet.isEnum) {
    doclet.kind = 'enum';
    delete doclet.isEnum;
  }
  return doclet;
}

function removeEnumChildren(json) {
  return json.filter(function (doclet) {
    var parent = json.find(where({ id: doclet.memberof }));
    if (parent && parent.kind === 'enum') {
      return false;
    } else {
      return true;
    }
  });
}