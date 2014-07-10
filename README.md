[![view on npm](http://img.shields.io/npm/v/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![npm module downloads per month](http://img.shields.io/npm/dm/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![Build Status](https://travis-ci.org/75lb/jsdoc-parse.svg?branch=master)](https://travis-ci.org/75lb/jsdoc-parse)
[![Dependency Status](https://david-dm.org/75lb/jsdoc-parse.svg)](https://david-dm.org/75lb/jsdoc-parse)

#jsdoc-parse
Exports a single function (`parse(options)`)..

**Example**  
```js
var parse = require("jsdoc-parse");
```

##Install
```sh
$ npm install -g jsdoc-parse
```
*Mac / Linux users may need to run with `sudo`*.

##API
<a name="module_jsdoc-parse"></a>
##parse(options) ⏏
Documented javascript source files in, doclet data out.

**Params**

- options `object` - options
  - [src] `string` | `Array.<string>` - source file(s) to parse
  - [private] `boolean` - include @private members in the output

**Returns**: `Stream` - a readable stream containing the parsed json data  
**Example**  
```js
> parse({ src: "lib/jsdoc-parse.js" }).pipe(process.stdout);
[
  {
    "kind": "module",
    "name": "jsdoc-parse",
    "examples": [
      "```js\nvar parse = require(\"jsdoc-parse\");\n```"
    ],
    "longname": "module:jsdoc-parse"
  },
  {
    "description": "Documented javascript source files in, doclet data out.",
    "alias": "module:jsdoc-parse",
    "params": [
      {
        "type": {
          "names": [
            "object"
          ]
        },
        "description": "options",
        "name": "options"
      },
      {
        "type": {
          "names": [
            "string",
            "Array.<string>"
          ]
        },
        "optional": true,
        "description": "source file(s) to parse",
        "name": "options.src"
      },
      {
        "type": {
          "names": [
            "boolean"
          ]
        },
        "optional": true,
        "description": "include @private members in the output",
        "name": "options.private"
      }
    ],
    "returns": [
      {
        "type": {
          "names": [
            "Stream"
          ]
        },
        "description": "a readable stream containing the parsed json data"
      }
    ],
    "examples": [
      "```js\nparse({ src: \"lib/jsdoc-parse.js\" }).pipe(process.stdout);\n```"
    ],
    "name": "module:jsdoc-parse",
    "longname": "module:jsdoc-parse",
    "kind": "function",
    "codeName": "parse"
  },
  {
    "files": [
      "/Users/Lloyd/Documents/75lb/jsdoc-parse/lib/jsdoc-parse.js"
    ],
    "kind": "package",
    "longname": "package:undefined"
  }
]
```

*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*
