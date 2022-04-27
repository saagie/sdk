const { NodeVM } = require('vm2');
const {
  Readable, Transform, Writable,
} = require('stream');
const { stringify, stringifyConsoleArgs } = require('./script-utils');

const LOG_EVENT_NAMES = [
  'console.debug',
  'console.log',
  'console.info',
  'console.warn',
  'console.error',
  'console.dir',
  'console.trace',
];

async function runInVM(scriptData, fun, args) {
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
      // required for a proper implementation of an axios interceptor with aws4 (see the integration test 'test-aws')
      URL,
    },
  });
  LOG_EVENT_NAMES.forEach((eventLogName) => {
    vm.on(eventLogName, (...eventArgs) => {
      process.send({ type: 'log', name: eventLogName, message: stringifyConsoleArgs(eventArgs) });
    });
  });
  // required by axios but not properly mocked by wm2
  // NB try to keep this on one line, so the line numbers of the script are preserved
  const pre = 'process.stdin={};process.stdout={};process.stderr={};';

  let script;
  try {
    script = vm.run(pre + scriptData);
  } catch (e) {
    // eslint-disable-next-line no-throw-literal
    throw { name: 'ScriptLoadError', message: e.message, stack: e.stack };
  }
  if (!(fun in script)) {
    // eslint-disable-next-line no-throw-literal
    throw { name: 'FunctionNotFound' };
  }
  try {
    // eslint-disable-next-line security/detect-object-injection
    return await script[fun].apply({}, args);
  } catch (e) {
    // eslint-disable-next-line no-throw-literal
    throw { name: 'ScriptRuntimeError', message: e.message, stack: e.stack };
  }
}

class StreamFlowControl {
  constructor(highWaterMark) {
    this.highWaterMark = highWaterMark;
    this.pending = 0;
    this.nextCallbacks = [];
  }

  onSent(sent, next) {
    this.pending += sent;
    if (this.pending > this.highWaterMark) {
      this.nextCallbacks.push(next);
    } else {
      next();
    }
  }

  onAck(acked) {
    this.pending -= acked;
    if (this.pending < this.highWaterMark) {
      const nextCallback = this.nextCallbacks.shift();
      if (typeof nextCallback === 'function') {
        nextCallback();
      }
    }
  }
}

const ToParentProcessStream = (flow) => new Writable({
  objectMode: true,
  write(chunk, enc, next) {
    process.send({
      type: 'chunk',
      chunk,
    });
    flow.onSent(1, next);
  },
});

function exitAfterTimeout() {
  // be safer than sorry, if not killed by the parent, let's end in 10s
  setTimeout(() => process.exit(), 10000);
}

function onFinish() {
  process.send({ type: 'finished' });
  exitAfterTimeout();
}

function onError(e) {
  process.send({ type: 'error', error: stringify(e) });
  exitAfterTimeout();
}

const ToLogStream = () => {
  const logBuffer = [];
  const _pushLog = (transform) => {
    transform.push({ log: logBuffer.join(''), stream: 'STDOUT', time: new Date().toISOString() });
    logBuffer.length = 0;
  };
  return new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
      let log = buffer.toString();
      while (log.length > 0) {
        const i = log.search(/\r\n|\n\r|\n|\r/);
        if (i >= 0) {
          logBuffer.push(log.substring(0, i));
          _pushLog(this);
          log = log.substring(0, i + 1);
        } else {
          logBuffer.push(log);
          log = '';
        }
      }
      callback();
    },
    flush(callback) {
      _pushLog(this);
      callback();
    },
  });
};

process.on('uncaughtException', onError);

const maxObjectsInTransit = 1000;
const flow = new StreamFlowControl(maxObjectsInTransit);

process.on('message', async (m) => {
  if (typeof m.ack !== 'undefined') {
    flow.onAck(m.ack);
    return;
  }

  if (m.scriptData) {
    try {
      const result = await runInVM(m.scriptData, m.fun, m.args);
      if (result instanceof Readable) {
        const logStream = ToLogStream();
        result.pause();
        result.pipe(logStream);
        const processStream = ToParentProcessStream(flow);
        processStream.on('finish', onFinish);
        processStream.on('error', onError);
        result.on('error', onError);
        logStream.pipe(processStream);
      } else {
        process.send({ type: 'result', result: JSON.stringify(stringify(result)) });
        exitAfterTimeout();
      }
    } catch (e) {
      onError(e);
    }
  }
});
