[![view on npm](http://img.shields.io/npm/v/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![npm module downloads per month](http://img.shields.io/npm/dm/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![Build Status](https://travis-ci.org/jsdoc2md/jsdoc-parse.svg?branch=master)](https://travis-ci.org/jsdoc2md/jsdoc-parse)
[![Dependency Status](https://david-dm.org/jsdoc2md/jsdoc-parse.svg)](https://david-dm.org/jsdoc2md/jsdoc-parse)

# jsdoc-parse
Jsdoc-annotated source code in, JSON format documentation out.

Essentially, the output is the raw JSON output of [jsdoc](https://github.com/jsdoc3/jsdoc) with a few extras:

* Support for html input files (see `--html` option).
* Support for new tags in the input javascript
  * `@category <string>`: Useful for grouping identifiers by category.
  * `@done`: Used to mark `@todo` items as complete. 
  * `@typicalname`: If set on a class, namespace or module, child members will documented using this typical name as the parent name. Real-world typical name examples are `$` (the typical name for `jQuery` instances), `_` (underscore) etc.
  * `@chainable`: Set to mark a method as chainable (has a return value of `this`).
* Some new fields: 
  * `id`: a unique identifier (the jsdoc `longname` field is not guaranteed unique)
  * `isExported`: set to true on the identifier which is exported from a module.
  * `todoList`: A list. 
  * `typicalname` 
  * `category` 
  * `order`: The sort position of the identifier in the source file. Useful for use in `--sort-by` expressions.
* A separate constructor record. In jsdoc, the class and constructor information are contained within the same record. In jsdoc-parse, the constructor information is separated from the class into a record with kind `"constructor"`.


## Synopsis
### Simple example
```
$ echo "/** a wonderful global */ var majestic = true;" | jsdoc-parse
[
  {
    "id": "majestic",
    "longname": "majestic",
    "name": "majestic",
    "scope": "global",
    "kind": "member",
    "description": "a wonderful global",
    "order": 0
  }
]
```

### Longer example
This input javascript: 
```js
/**
Pump an idiot full of volts. Returns a promise they will slump. 
@deprecated
@param {object | array} - the victim(s) to fry
@param [crazyHair=true] {boolean} - optional spikey hair effect
@return {external:Promise}
@resolve {Slump}
*/
function taze(victim, crazyHair){}
```

returns this JSON:
```json
$ jsdoc-parse example/function.js
[
  {
    "id": "taze",
    "longname": "taze",
    "name": "taze",
    "scope": "global",
    "kind": "function",
    "description": "Pump an idiot full of volts. Returns a promise they will slump.",
    "params": [
      {
        "type": {
          "names": [
            "object",
            "array"
          ]
        },
        "description": "the victim(s) to fry",
        "name": "victim"
      },
      {
        "type": {
          "names": [
            "boolean"
          ]
        },
        "optional": true,
        "defaultvalue": true,
        "description": "optional spikey hair effect",
        "name": "crazyHair"
      }
    ],
    "returns": [
      {
        "type": {
          "names": [
            "external:Promise"
          ]
        }
      }
    ],
    "deprecated": true,
    "customTags": [
      {
        "tag": "resolve",
        "value": "{Slump}"
      }
    ],
    "order": 0
  }
]
```

### HTML input example
This input HTML:
```html
<!DOCTYPE html>
<html>
  <head>
    <script>
    /**
    something in the head
    @type {number}
    */
    var headGlobal = 1;
    </script>
  </head>
  <body class="main">
    <script>
    /**
    body global
    @type {string}
    @default
    */
    var bodyGlobal = "one";
    
    </script>
  </body>
</html>
```

produces this JSON output: 
```json
$ jsdoc-parse example/doc.html --html
[
  {
    "id": "headGlobal",
    "longname": "headGlobal",
    "name": "headGlobal",
    "scope": "global",
    "kind": "member",
    "description": "something in the head",
    "type": {
      "names": [
        "number"
      ]
    },
    "order": 0
  },
  {
    "id": "bodyGlobal",
    "longname": "bodyGlobal",
    "name": "bodyGlobal",
    "scope": "global",
    "kind": "member",
    "description": "body global",
    "type": {
      "names": [
        "string"
      ]
    },
    "defaultvalue": "one",
    "order": 1
  }
]
```

## Install and use

### Compatible Platforms
Tested on Mac OSX, Linux, Windows 8.1 and Windows XP. 

### As a command-line tool
Useful for quick access to the data.. 

```
$ npm install -g jsdoc-parse
$ jsdoc-parse --help

  jsdoc-parse
  Jsdoc-annotated source code in, JSON format documentation out.

  Usage
  $ jsdoc-parse <files>
  $ cat <files> | jsdoc-parse

  --private              Include identifiers marked @private in the output
  --stats                Print a few stats about the doclets parsed
  --html                 Enable experimental parsing of .html files
  --src <array>          A list of javascript source files or glob expressions
  -s, --sort-by <array>  Sort by one of more fields, e.g. `--sort-by kind category`. Defaults to 'scope kind'.
  -h, --help
```

***Usage form 2 warning***: When piping input into `jsdoc-parse` it will intepret the whole of what is piped in as a single file, so take care not to pipe in input containing multipe @modules as this is illegal in jsdoc (see [here](http://usejsdoc.org/tags-module.html)):

> The @module tag marks the current file as being its own module. All symbols in the file are assumed to be members of the module unless documented otherwise.

### As a library
For use within your node.js app. 

```sh
$ npm install jsdoc-parse --save
```

##API Reference
  Exports a single function to parse jsdoc data.

**Example**  
```js
var parse = require("jsdoc-parse");
```

* [jsdoc-parse](#module_jsdoc-parse)
  * [jsdocParse([options])](#exp_module_jsdoc-parse--jsdocParse) ⇒ <code>[TransformStream](http://nodejs.org/api/stream.html#stream_class_stream_transform)</code> ⏏
    * [~ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)
      * [.src](#module_jsdoc-parse--jsdocParse..ParseOptions#src) : <code>string</code> &#124; <code>Array.&lt;string&gt;</code>
      * [.private](#module_jsdoc-parse--jsdocParse..ParseOptions#private) : <code>boolean</code>
      * [.stats](#module_jsdoc-parse--jsdocParse..ParseOptions#stats) : <code>boolean</code>
      * [.html](#module_jsdoc-parse--jsdocParse..ParseOptions#html) : <code>boolean</code>
      * [.sort-by](#module_jsdoc-parse--jsdocParse..ParseOptions#sort-by) : <code>array</code>

<a name="exp_module_jsdoc-parse--jsdocParse"></a>
### jsdocParse([options]) ⇒ <code>[TransformStream](http://nodejs.org/api/stream.html#stream_class_stream_transform)</code> ⏏
Documented javascript source in, documentation JSON out.

**Kind**: Exported function  
**Params**

- [options] <code>[ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)</code> - parse options  

**Example**  
```js
parse({ src:"lib/jsdoc-parse.js" }).pipe(process.stdout);
```
<a name="module_jsdoc-parse--jsdocParse..ParseOptions"></a>
#### jsdocParse~ParseOptions
All options for jsdoc-parse, including defaults

**Kind**: inner class of <code>[jsdocParse](#exp_module_jsdoc-parse--jsdocParse)</code>  

* [~ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)
  * [.src](#module_jsdoc-parse--jsdocParse..ParseOptions#src) : <code>string</code> &#124; <code>Array.&lt;string&gt;</code>
  * [.private](#module_jsdoc-parse--jsdocParse..ParseOptions#private) : <code>boolean</code>
  * [.stats](#module_jsdoc-parse--jsdocParse..ParseOptions#stats) : <code>boolean</code>
  * [.html](#module_jsdoc-parse--jsdocParse..ParseOptions#html) : <code>boolean</code>
  * [.sort-by](#module_jsdoc-parse--jsdocParse..ParseOptions#sort-by) : <code>array</code>

<a name="module_jsdoc-parse--jsdocParse..ParseOptions#src"></a>
##### parseOptions.src : <code>string</code> &#124; <code>Array.&lt;string&gt;</code>
The source files to parse. If this option is not set jsdoc-parse will wait for input to be streamed in.

**Kind**: instance property of <code>[ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)</code>  
**Example**  
```js
var parse = require("jsdoc-parse");
var fs = require("fs");

// either supply one or more file names
parse({ src: "example.js" }).pipe(process.stdout);

// or pipe in source code
fs.createReadStream("example.js").parse().pipe(process.stdout);
```
<a name="module_jsdoc-parse--jsdocParse..ParseOptions#private"></a>
##### parseOptions.private : <code>boolean</code>
Include identifier documentation marked as `@private` in the output

**Kind**: instance property of <code>[ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)</code>  
**Default**: <code>false</code>  
<a name="module_jsdoc-parse--jsdocParse..ParseOptions#stats"></a>
##### parseOptions.stats : <code>boolean</code>
Print a few stats about the doclets parsed

**Kind**: instance property of <code>[ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)</code>  
<a name="module_jsdoc-parse--jsdocParse..ParseOptions#html"></a>
##### parseOptions.html : <code>boolean</code>
Enable experimental parsing of .html files.

**Kind**: instance property of <code>[ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)</code>  
**Default**: <code>false</code>  
<a name="module_jsdoc-parse--jsdocParse..ParseOptions#sort-by"></a>
##### parseOptions.sort-by : <code>array</code>
Sort by one of more fields, e.g. `--sort-by kind category`.

**Kind**: instance property of <code>[ParseOptions](#module_jsdoc-parse--jsdocParse..ParseOptions)</code>  
**Default**: <code>[&quot;scope&quot;,&quot;category&quot;,&quot;kind&quot;,&quot;order&quot;]</code>  

* * * 

&copy; 2015 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown).
