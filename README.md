[![view on npm](http://img.shields.io/npm/v/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![npm module downloads](http://img.shields.io/npm/dt/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![Build Status](https://travis-ci.org/jsdoc2md/jsdoc-parse.svg?branch=master)](https://travis-ci.org/jsdoc2md/jsdoc-parse)
[![Dependency Status](https://david-dm.org/jsdoc2md/jsdoc-parse.svg)](https://david-dm.org/jsdoc2md/jsdoc-parse)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://github.com/feross/standard)
[![Join the chat at https://gitter.im/jsdoc2md/jsdoc2md](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/jsdoc2md/jsdoc2md?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# jsdoc-parse
Transforms [jsdoc](https://github.com/jsdoc3/jsdoc) data, adding a few features:

* Support for new tags in the input javascript
  * `@category <string>`: Useful for grouping identifiers by category.
  * `@done`: Used to mark `@todo` items as complete.
  * `@typicalname`: If set on a class, namespace or module, child members will documented using this typical name as the parent name. Real-world typical name examples are `$` (the typical name for `jQuery` instances), `_` (underscore) etc.
  * `@chainable`: Set to mark a method as chainable (has a return value of `this`).

## API Reference
<a name="module_jsdoc-parse"></a>

## jsdoc-parse
**Example**  
```js
const jsdocParse = require('jsdoc-parse')
```
<a name="exp_module_jsdoc-parse--jsdocParse"></a>

### jsdocParse(jsdocData, [options]) ⇒ <code>Array.&lt;object&gt;</code> ⏏
**Kind**: Exported function  
**Params**

- jsdocData <code>Array.&lt;object&gt;</code> - jsdoc output
- [options] <code>object</code>
    - [.sort-by] <code>string</code> | <code>Array.&lt;string&gt;</code> - Sort by one of more properties, e.g. `[ 'kind', 'category' ]`. Defaults to `[ 'scope', 'category', 'kind', 'order' ]`.


* * *

&copy; 2014-16 Lloyd Brookes \<75pound@gmail.com\>. Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown).
