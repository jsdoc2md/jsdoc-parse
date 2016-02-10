[![view on npm](http://img.shields.io/npm/v/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![npm module downloads](http://img.shields.io/npm/dt/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![Build Status](https://travis-ci.org/jsdoc2md/jsdoc-parse.svg?branch=master)](https://travis-ci.org/jsdoc2md/jsdoc-parse)
[![Dependency Status](https://david-dm.org/jsdoc2md/jsdoc-parse.svg)](https://david-dm.org/jsdoc2md/jsdoc-parse)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/jsdoc2md/jsdoc2md](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jsdoc2md/jsdoc2md?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# jsdoc-parse
Jsdoc explain out in, jsdoc2md template data out.

jsdoc-parse extends [jsdoc](https://github.com/jsdoc3/jsdoc) with a few features:

* Support for html input files (see `--html` option).
* Support for new tags in the input javascript
  * `@category <string>`: Useful for grouping identifiers by category.
  * `@done`: Used to mark `@todo` items as complete.
  * `@typicalname`: If set on a class, namespace or module, child members will documented using this typical name as the parent name. Real-world typical name examples are `$` (the typical name for `jQuery` instances), `_` (underscore) etc.
  * `@chainable`: Set to mark a method as chainable (has a return value of `this`).

## API Reference

<a name="module_jsdoc-parse"></a>
  
**Example**
```js
var jsdocParse = require('jsdoc-parse')
```

* jsdoc-parse
    * [~parse(jsdocExplainOutput, [options])](#module_jsdoc-parse..parse)   
    * [~applyOptions(data, options)](#module_jsdoc-parse..applyOptions) ⇒ `string`  
    * [~getStats(data)](#module_jsdoc-parse..getStats) ⇒ `object`  


<a name="module_jsdoc-parse..parse"></a>
### jsdoc-parse~parse(jsdocExplainOutput, [options])   
**Kind**: inner method of module:jsdoc-parse  
**Params**

- jsdocExplainOutput Array.<object> - jsdoc output
- [options] object
    - [.private] boolean - Include identifier documentation marked as `@private` in the output
    - [.html] boolean - Enable experimental parsing of .html files.
    - [.sort-by] Array.<string> <code> = [ 'scope', 'category', 'kind', 'order' ]</code> - Sort by one of more fields, e.g. `--sort-by kind category`. Pass the special value `none` to remove the default sort order.

<a name="module_jsdoc-parse..applyOptions"></a>
### jsdoc-parse~applyOptions(data, options) ⇒ `string`  
**Kind**: inner method of module:jsdoc-parse  
**Params**

- data string - input json string
- options object - jsdoc-parse options

<a name="module_jsdoc-parse..getStats"></a>
### jsdoc-parse~getStats(data) ⇒ `object`  
return some stats about the parsed data

**Kind**: inner method of module:jsdoc-parse  
**Params**

- data object - jsdoc-parse data


* * *

&copy; 2015 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown).
