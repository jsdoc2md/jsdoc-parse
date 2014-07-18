[![view on npm](http://img.shields.io/npm/v/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![npm module downloads per month](http://img.shields.io/npm/dm/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![Build Status](https://travis-ci.org/75lb/jsdoc-parse.svg?branch=master)](https://travis-ci.org/75lb/jsdoc-parse)
[![Dependency Status](https://david-dm.org/75lb/jsdoc-parse.svg)](https://david-dm.org/75lb/jsdoc-parse)

#jsdoc-parse
Jsdoc-annotated javascript source files in, [dmd](https://github.com/75lb/dmd) input data out. 

**Compatible Platforms**
MacOSX and Linux only until [this upstream bug](https://github.com/jsdoc3/jsdoc/issues/713) is fixed. 

##As a command-line tool
Useful for quick access to the data.. 

###Install
```sh
$ npm install -g jsdoc-parse
```

###Usage
```
$ jsdoc-parse <src_files>
$ cat <src_files> | jsdoc-parse 
```

***Usage form 2 edge case warning***: `jsdoc-parse` will intepret whatever is piped in as a single file, so take care not to pipe in input containing multipe @modules as this is illegal in jsdoc (see [here](http://usejsdoc.org/tags-module.html)):

> The @module tag marks the current file as being its own module. All symbols in the file are assumed to be members of the module unless documented otherwise.

###Example
```sh
$ echo "/** a wonderful global */ var majestic = true;" | jsdoc-parse
[
  {
    "description": "a wonderful global",
    "name": "majestic",
    "longname": "majestic",
    "kind": "member",
    "scope": "global"
  }
]
```

##As a library
For use within node.js. 

###Install
```sh
$ npm install jsdoc-parse --save
```

###API Reference
Exports a single function (`parse`) to parse jsdoc data.

**Example**  
```js
var parse = require("jsdoc-parse");
```

<a name="exp_module_jsdoc-parse"></a>
####parse(src, options) ⏏
Documented javascript source files in, doclet data out.

**Params**

- src `string` | `Array.<string>` - source file(s) to parse
- options `object` - options
  - [stats] `boolean` - Return stats about the doclets parsed
  - [private] `boolean` - include @private members in the output

**Returns**: `Stream` - a readable stream containing the parsed json data  
**Example**  
Code like this: 
```js
parse("lib/jsdoc-parse.js").pipe(process.stdout);
```

would output something like: 
```json
[
  {
    "description": "Exports a single function (`parse`) to parse jsdoc data.",
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
            "string",
            "Array.<string>"
          ]
        },
        "description": "source file(s) to parse",
        "name": "src"
      },
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
            "boolean"
          ]
        },
        "optional": true,
        "description": "Return stats about the doclets parsed",
        "name": "options.stats"
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
    "name": "module:jsdoc-parse",
    "longname": "module:jsdoc-parse",
    "kind": "function"
  }
]
```




*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*
