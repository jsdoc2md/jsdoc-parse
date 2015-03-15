[![view on npm](http://img.shields.io/npm/v/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![npm module downloads per month](http://img.shields.io/npm/dm/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![Build Status](https://travis-ci.org/75lb/jsdoc-parse.svg?branch=master)](https://travis-ci.org/75lb/jsdoc-parse)
[![Dependency Status](https://david-dm.org/75lb/jsdoc-parse.svg)](https://david-dm.org/75lb/jsdoc-parse)

# jsdoc-parse
Jsdoc-annotated source code in, JSON format documentation out. The input can be plain javascript or html (see `--html` option). Essentially, the output is the raw JSON output of [jsdoc](https://github.com/jsdoc3/jsdoc) with a few modifications:

* Some new fields: `id` (unique identifier), `isExported`, `thisvalue`, `typicalname`, `category` and `todoList`
* A new kind: `"constructor"`. The constructor record is separated from the class.
* Support for new tags: `@category`, `@done`, `@typicalname`, `@chainable`
  

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
```
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

***Usage form 2 edge case warning***: `jsdoc-parse` will intepret whatever is piped in as a single file, so take care not to pipe in input containing multipe @modules as this is illegal in jsdoc (see [here](http://usejsdoc.org/tags-module.html)):

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
<a name="exp_module_jsdoc-parse--parse"></a>
### parse(src, options) ⇒ <code>[Transform](http://nodejs.org/api/stream.html#stream_class_stream_transform)</code> ⏏
Documented javascript source in, documentation JSON out.

**Kind**: Exported function  
**Todo**

- [ ] split into two separate methods

**Params**

- src <code>string</code> | <code>Array.&lt;string&gt;</code> - source file(s) to parse  
- options <code>object</code> - options  
  - \[stats =<code>false</code>\] <code>boolean</code> - Return stats about the doclets parsed  
  - \[private =<code>false</code>\] <code>boolean</code> - include @private members in the output  
  - \[html =<code>false</code>\] <code>boolean</code> - if set, you can parse jsdoc from html files  
  - \[sort-by =<code>\[ &quot;scope&quot;, &quot;category&quot;, &quot;kind&quot;, &quot;order&quot; \]</code>\] <code>Array</code> - sort the output  

**Example**  
```js
parse("lib/jsdoc-parse.js").pipe(process.stdout);
```

* * * 

&copy; 2015 Lloyd Brookes \<75pound@gmail.com\>. *Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.
