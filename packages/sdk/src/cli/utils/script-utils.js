const Stream = require('stream');

// function to convert Errors into a simple object of strings, in order to keep information while serialized
const stringify = (value) => {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (value instanceof Stream) {
    return '<[stream]>';
  }
  if (value instanceof Buffer) {
    return '<[buffer]>';
  }
  if (value instanceof Array || value instanceof Int8Array || value instanceof Uint8Array
    || value instanceof Uint8ClampedArray || value instanceof Int16Array
    || value instanceof Uint16Array || value instanceof Int32Array
    || value instanceof Uint32Array || value instanceof Float32Array
    || value instanceof Float32Array || value instanceof Float64Array) {
    return value.slice(0, 100).map((it) => stringify(it));
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  if (typeof value === 'object') {
    const o = {};
    Object.keys(value).forEach((key) => {
      // eslint-disable-next-line security/detect-object-injection
      o[key] = stringify(value[key]);
    });
    return o;
  }
  return value;
};
exports.stringify = stringify;

exports.stringifyConsoleArgs = (args) => (args || [])
  .map((a) => {
    if (typeof a === 'undefined') {
      return 'undefined';
    }
    if (a === null) {
      return 'null';
    }
    if (typeof a === 'object') {
      return JSON.stringify(stringify(a));
    }
    return a.toString();
  })
  .join(' ');
