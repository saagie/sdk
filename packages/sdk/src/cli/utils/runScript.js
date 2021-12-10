const { NodeVM } = require('vm2');

exports.runScript = async (scriptData, fun, args) => {
  const vm = new NodeVM({
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
  // required by axios but not properly mocked by wm2
  const pre = 'process.stdin={};process.stdout={};process.stderr={};';

  const script = vm.run(pre + scriptData);
  if (!(fun in script)) {
    throw new Error(`Function ${fun} not found in script`);
  }
  // eslint-disable-next-line security/detect-object-injection
  return script[fun](args);
};
