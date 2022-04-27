const { NodeVM } = require('vm2');
const { Stream } = require('stream');

const LOG_EVENT_NAMES = [
  'console.debug',
  'console.log',
  'console.info',
  'console.warn',
  'console.error',
  'console.dir',
  'console.trace',
];

// function to convert Errors into a simple object of strings, in order to keep information while serialized
const stringify = (value) => {
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

function stringifyConsoleArgs(args) {
  return (args || [])
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
}

exports.runScript = async (scriptData, fun, args, logger) => {
  const vm = new NodeVM({
    console: 'redirect',
    require: {
      builtin: [
        'assert',
        'assert/strict',
        'async_hooks',
        'buffer',
        // 'child_process',
        // 'cluster',
        // 'console',
        // 'constants',
        'crypto',
        'dgram',
        // 'diagnostics_channel',
        'dns',
        'dns/promises',
        'domain',
        // 'events',
        // 'fs',
        // 'fs/promises',
        'http',
        'http2',
        'https',
        // 'inspector',
        // 'module',
        // 'net',
        'os',
        // 'path',
        // 'path/posix',
        // 'path/win32',
        // 'perf_hooks',
        // 'process',
        'punycode',
        'querystring',
        'readline',
        'readline/promises',
        // 'repl',
        'stream',
        'stream/consumers',
        'stream/promises',
        'stream/web',
        'string_decoder',
        // 'sys',
        'timers',
        'timers/promises',
        'tls',
        // 'trace_events',
        'tty',
        'url',
        'util',
        'util/types',
        // 'v8',
        // 'vm',
        // 'wasi',
        // 'worker_threads',
        'zlib',
      ],
    },
    sandbox: {
      URL,
    },
  });
  LOG_EVENT_NAMES.forEach((eventLogName) => {
    vm.on(eventLogName, (...eventArgs) => {
      logger({ name: eventLogName, message: stringifyConsoleArgs(eventArgs) });
    });
  });
  // required by axios but not properly mocked by wm2
  const pre = 'process.stdin={};process.stdout={};process.stderr={};';

  const script = vm.run(pre + scriptData);
  if (!(fun in script)) {
    throw new Error(`Function ${fun} not found in script`);
  }
  // eslint-disable-next-line security/detect-object-injection
  return script[fun](args);
};
