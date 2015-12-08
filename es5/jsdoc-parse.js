'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var cp = require('child_process');
var path = require('path');
var util = require('util');
var a = require('array-tools');
var o = require('object-tools');
var fs = require('fs');
var fileSet = require('file-set');
var Transform = require('stream').Transform;
var cliOptions = require('./cli-options');
var os = require('os');
var getTempPath = require('temp-path');

function tempPath() {
  return getTempPath() + 'jsdoc-parse.js';
}

module.exports = jsdocParse;
jsdocParse.cliOptions = cliOptions.definitions;

var ParseOptions = function ParseOptions() {
  _classCallCheck(this, ParseOptions);

  this.src = null;

  this.private = false;

  this.stats;

  this.html = false;

  this['sort-by'] = ['scope', 'category', 'kind', 'order'];
};

function jsdocParse(options) {
  options = o.extend(new ParseOptions(), options);
  var src = options.src;

  if (src) {
    var inputFiles = fileSet(src);
    src = inputFiles.files;

    var output = new OutputTransform(options);

    if (!src.length) {
      var msg = util.format('[jsdoc-parse] please specify valid input files. ');
      if (inputFiles.notExisting) {
        msg += 'These files do not exist: ' + inputFiles.notExisting.join(', ');
      }

      process.nextTick(function () {
        output.emit('error', new Error(msg));
      });
    } else {
      getJsdocOutput(src, options, function (err, data) {
        if (err) {
          output.emit('error', err);
        } else {
          output.end(data);
        }
      });
    }
    return output;
  } else {
    var inputStream = new Transform();
    var inputFilePath = tempPath();

    var buf = new Buffer(0);
    inputStream._transform = function (chunk, enc, done) {
      if (chunk) buf = Buffer.concat([buf, chunk]);
      done();
    };
    inputStream._flush = function (done) {
      var self = this;
      fs.writeFileSync(inputFilePath, buf);
      getJsdocOutput([inputFilePath], options, function (err, data) {
        if (err) {
          done(err);
        } else {
          try {
            data = applyOptions(data, options);
            self.push(data);
            self.push(null);
            done();
          } catch (err) {
            done(err);
          }
        }
        fs.unlinkSync(inputFilePath);
      });
    };
    return inputStream;
  }
}

function OutputTransform(options) {
  Transform.call(this);
  this.json = new Buffer(0);
  this._transform = function (chunk, enc, done) {
    if (chunk) this.json = Buffer.concat([this.json, chunk]);
    done();
  };
  this._flush = function () {
    try {
      this.json = applyOptions(this.json, options);
    } catch (err) {
      err.message += ' [Problem parsing the JSON data output by jsdoc, input data: ' + this.json.toString().substr(0, 100) + ']';
      return this.emit('error', err);
    }
    this.push(this.json);
    this.push(null);
  };
}
util.inherits(OutputTransform, Transform);

function getJsdocOutput(src, options, done) {
  var jsdocTemplatePath = __dirname;
  var jsdocPath = path.resolve(__dirname, '../node_modules/.bin/jsdoc');

  if (!fs.existsSync(jsdocPath)) {
    throw Error('jsdoc-parse: cannot find jsdoc: ' + jsdocPath);
  }
  var args = [jsdocPath, '--pedantic', '-t', jsdocTemplatePath];
  if (options.html) {
    args = args.concat(['-c', path.resolve(__dirname, 'default-conf.json')]);
  } else if (options.conf) {
    args = args.concat(['-c', path.resolve(options.conf)]);
  }
  args = args.concat(src);

  var outputFilePath = tempPath();
  var outputFile = fs.openSync(outputFilePath, 'w');
  var outputStderrPath = tempPath();
  var outputStderr = fs.openSync(outputStderrPath, 'w');
  var handle = cp.spawn('node', args, { stdio: [process.stdin, outputFile, outputStderr] });
  handle.on('error', done);
  handle.on('close', function (code) {
    var stderr = fs.readFileSync(outputStderrPath, 'utf8');
    var stdout = fs.readFileSync(outputFilePath, 'utf8');
    if (/no input files/.test(stdout)) code = 1;

    if (code) {
      fs.unlinkSync(outputFilePath);
      fs.unlinkSync(outputStderrPath);
      done(new Error(stderr || stdout));
    } else {
      fs.unlinkSync(outputFilePath);
      fs.unlinkSync(outputStderrPath);
      done(null, stdout);
    }
  });
}

function applyOptions(data, options) {
  data = JSON.parse(data.toString());
  if (options.stats) {
    return JSON.stringify(getStats(data), null, '  ') + '\n';
  } else {
    data = data.filter(function (item) {
      if (options.private) {
        return item.ignore === undefined;
      } else {
        return item.ignore === undefined && item.access !== 'private';
      }
    });

    if (options['sort-by'] && !a(options['sort-by']).contains('none')) {
      data = sort(data, options['sort-by']);
    }
    return JSON.stringify(data, null, '  ') + '\n';
  }
}

function getStats(data) {
  var stats = {
    identifiers: {}
  };
  var kinds = ['module', 'class', 'constructor', 'mixin', 'member', 'namespace', 'constant', 'function', 'event', 'typedef', 'external'];
  kinds.forEach(function (kind) {
    stats.identifiers[kind] = a(data).where({ kind: kind }).pluck('longname').val();
  });
  console.log(stats);
  return stats;
}

function sort(array, sortBy) {
  var order = {
    kind: ['class', 'constructor', 'mixin', 'member', 'namespace', 'constant', 'function', 'event', 'typedef', 'external'],
    scope: ['global', 'instance', 'static', 'inner']
  };

  if (!sortBy) {
    return array;
  } else {
    return a.sortBy(array, sortBy, order);
  }
}