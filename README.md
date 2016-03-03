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
  
**Example**
```js
var jsdocParse = require('jsdoc-parse')
```


### parse(jsdocData, [options]) ⇒ Array.&lt;object&gt; ⏏
**Kind**: Exported function  
__Params__

- jsdocData Array.&lt;object&gt; - jsdoc output
- [options] object
    - [.private] boolean - Include identifier documentation marked as `@private` in the output




* * *

&copy; 2014-16 Lloyd Brookes <75pound@gmail.com>. Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown).
