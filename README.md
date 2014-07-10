[![view on npm](http://img.shields.io/npm/v/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![npm module downloads per month](http://img.shields.io/npm/dm/jsdoc-parse.svg)](https://www.npmjs.org/package/jsdoc-parse)
[![Build Status](https://travis-ci.org/75lb/jsdoc-parse.svg?branch=master)](https://travis-ci.org/75lb/jsdoc-parse)
[![Dependency Status](https://david-dm.org/75lb/jsdoc-parse.svg)](https://david-dm.org/75lb/jsdoc-parse)

<a name="module_jsdoc-parse"></a>
#jsdoc-parse
**Example**  
```js
var parse = require("jsdoc-parse");
```

<a name="module_jsdoc-parse"></a>
##parse(options) ⏏
**Params**

- options `object` - options
  - [src] `Array.<string>` - an array of source files to parse
  - [private] `boolean` - include @private members in the output

**Returns**: `Transform`  
#Global
* [publish(data, opts)](#publish)

<a name="publish"></a>
##publish(data, opts)
Generate documentation output.

**Params**

- data `TAFFY` - A TaffyDB collection representing
                      all the symbols documented in your code.
- opts `object` - An object with options information.

