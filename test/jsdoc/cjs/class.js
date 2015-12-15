[
  {
    "comment": "/**\nexports a class\n@module cjs/class\n@typicalname exp\n*/",
    "meta": {
      "range": [
        0,
        57
      ],
      "filename": "class.js",
      "lineno": 1,
      "path": "/Users/lloyd/Documents/75lb/jsdoc-parse/test/fixture/cjs",
      "code": {}
    },
    "description": "exports a class",
    "kind": "module",
    "name": "cjs/class",
    "tags": [
      {
        "originalTitle": "typicalname",
        "title": "typicalname",
        "text": "exp",
        "value": "exp"
      }
    ],
    "longname": "module:cjs/class"
  },
  {
    "comment": "",
    "meta": {
      "range": [
        58,
        88
      ],
      "filename": "class.js",
      "lineno": 6,
      "path": "/Users/lloyd/Documents/75lb/jsdoc-parse/test/fixture/cjs",
      "code": {
        "id": "astnode100000002",
        "name": "module.exports",
        "type": "Identifier",
        "value": "ExportedClass",
        "paramnames": []
      }
    },
    "undocumented": true,
    "name": "module:cjs/class",
    "longname": "module:cjs/class",
    "kind": "member"
  },
  {
    "comment": "/**\nthe exported contructor\n@class\n@classdesc the exported class\n@alias module:cjs/class\n*/",
    "meta": {
      "range": [
        182,
        266
      ],
      "filename": "class.js",
      "lineno": 14,
      "path": "/Users/lloyd/Documents/75lb/jsdoc-parse/test/fixture/cjs",
      "code": {
        "id": "astnode100000007",
        "name": "ExportedClass",
        "type": "FunctionDeclaration",
        "paramnames": [
          "one",
          "two"
        ]
      },
      "vars": {
        "this.prop": "module:cjs/class#prop"
      }
    },
    "description": "the exported contructor",
    "kind": "class",
    "classdesc": "the exported class",
    "alias": "module:cjs/class",
    "name": "module:cjs/class",
    "longname": "module:cjs/class",
    "params": []
  },
  {
    "comment": "/**\n  instance property\n  */",
    "meta": {
      "range": [
        251,
        264
      ],
      "filename": "class.js",
      "lineno": 18,
      "path": "/Users/lloyd/Documents/75lb/jsdoc-parse/test/fixture/cjs",
      "code": {
        "id": "astnode100000013",
        "name": "this.prop",
        "type": "Literal",
        "value": 1,
        "paramnames": []
      }
    },
    "description": "instance property",
    "name": "prop",
    "longname": "module:cjs/class#prop",
    "kind": "member",
    "memberof": "module:cjs/class",
    "scope": "instance"
  },
  {
    "comment": "/**\na static property for the exported class\n*/",
    "meta": {
      "range": [
        315,
        343
      ],
      "filename": "class.js",
      "lineno": 23,
      "path": "/Users/lloyd/Documents/75lb/jsdoc-parse/test/fixture/cjs",
      "code": {
        "id": "astnode100000019",
        "name": "ExportedClass.staticProp",
        "type": "Literal",
        "value": 1,
        "paramnames": []
      }
    },
    "description": "a static property for the exported class",
    "name": "staticProp",
    "longname": "module:cjs/class.staticProp",
    "kind": "member",
    "memberof": "module:cjs/class",
    "scope": "static"
  },
  {
    "comment": "/**\ninner module property \n*/",
    "meta": {
      "range": [
        379,
        392
      ],
      "filename": "class.js",
      "lineno": 28,
      "path": "/Users/lloyd/Documents/75lb/jsdoc-parse/test/fixture/cjs",
      "code": {
        "id": "astnode100000025",
        "name": "innerProp",
        "type": "Literal",
        "value": 1
      }
    },
    "description": "inner module property",
    "name": "innerProp",
    "longname": "module:cjs/class~innerProp",
    "kind": "member",
    "scope": "inner",
    "memberof": "module:cjs/class"
  },
  {
    "kind": "package",
    "longname": "package:undefined",
    "files": [
      "/Users/lloyd/Documents/75lb/jsdoc-parse/test/fixture/cjs/class.js"
    ]
  }
]
