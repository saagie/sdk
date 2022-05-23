// eslint-disable-next-line max-classes-per-file
const { NodeVM } = require('vm2');
const { Readable, Writable } = require('stream');
const { stringify, stringifyConsoleArgs } = require('./script-utils');
const { NullOrUndefinedError, NonObjectModeReadableError } = require('./errors');

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
      process.send({ type: 'stdout', name: eventLogName, message: stringifyConsoleArgs(eventArgs) });
    });
  });
  // required by axios but not properly mocked by vm2
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

class ParentProcessSender extends Writable {
  constructor(process, flow) {
    super({ objectMode: true });
    this.process = process;
    this.flow = flow;
  }

  _write(chunk, _, callback) {
    this.process.send({
      type: 'chunk',
      chunk,
    });
    this.flow.onSent(1, callback);
  }
}

class SingleEntityStream extends Readable {
  constructor(entity) {
    super({ objectMode: true });
    this.entity = entity;
  }

  _read() {
    this.push(this.entity);
    this.push(null);
  }
}

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

process.on('uncaughtException', onError);

const maxObjectsInTransit = 1000; // FIXME this should be dictated by the speed at which the reader (webapp) is consuming the response, back pressure is not applied end-to-end here, if client buffer (socket, network card or whichever buffer) cannot handle 1000, it will explode because of us
const flow = new StreamFlowControl(maxObjectsInTransit);

process.on('message', async (m) => {
  if (typeof m.ack !== 'undefined') {
    flow.onAck(m.ack);
    return;
  }

  if (m.scriptData) {
    try {
      let result = await runInVM(m.scriptData, m.fun, m.args);
      if (!result) {
        onError(new NullOrUndefinedError('Script return value should not be null or undefined.'));
        exitAfterTimeout();
        return;
      }

      if (!(result instanceof Readable)) {
        result = new SingleEntityStream(result);
      }

      if (!result.readableObjectMode) {
        onError(new NonObjectModeReadableError('Stream should be in object mode for proper processing.'));
        exitAfterTimeout();
      } else {
        result
          .pipe(new ParentProcessSender(process, flow)
            .on('finish', onFinish)
            .on('error', onError));
      }
    } catch (e) {
      onError(e);
    }
  }
});
