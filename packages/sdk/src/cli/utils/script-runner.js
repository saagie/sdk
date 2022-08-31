const { fork } = require('child_process');
const { Readable } = require('stream');
const path = require('path');
const {
  ScriptExecError,
  ScriptHaltError,
} = require('./errors');

const childProcessTimeout = 10 * 1000; // FIXME: to be retrieve from conf

class ChildResponseReceiver extends Readable {
  constructor(childProcess) {
    super({ objectMode: true });
    this.pendingChunks = [];
    this.childProcess = childProcess;
  }

  // queue chunks when downstream reader signals backpressure
  buffer(chunk) {
    this.pendingChunks.push(chunk);
  }

  _read() {
    let backpressure = false;
    // unqueue chunks now that downstream reader signals it is ready for more
    while (this.pendingChunks.length > 0) {
      backpressure = !this.push(this.pendingChunks.shift());
      this.childProcess.send({ ack: 1 });
      if (backpressure) {
        // stop loop if reader signals backpressure again during unqueueing
        return;
      }
    }
  }
}

// eslint-disable-next-line max-len
exports.runScript = async (scriptId, scriptData, fun, args, scriptLogger) => new Promise((resolve, reject) => {
  // https://github.com/patriksimek/vm2/issues/355
  // this function can safely be used from the main process. sandbox is limited to JSON values
  const childRunnerFile = path.resolve(__dirname, 'script-runner-child');
  const childProcess = fork(childRunnerFile, [], {
    env: {},
    execArgv: [],
  });
  let lastStreamedLogDate = null;
  let kto = null;

  function setupKillTimeout(timeout) {
    return setTimeout(() => {
      if (lastStreamedLogDate == null) {
        childProcess.kill(9);
      } else {
        const now = new Date();
        const timeWithoutChunk = now.getTime() - lastStreamedLogDate.getTime();
        if (timeWithoutChunk > timeout) {
          childProcess.kill(9);
        } else {
          kto = setupKillTimeout(childProcessTimeout - timeWithoutChunk);
        }
      }
    }, timeout);
  }

  kto = setupKillTimeout(childProcessTimeout);
  let result = null;
  let scriptResponseStream = null;
  let streamEnded = false;
  let backpressure = false;
  childProcess.on('message', (m) => {
    switch (m.type) {
      case 'result': {
        if (scriptResponseStream !== null) {
          // eslint-disable-next-line no-console
          console.error(`Streaming already started, ignoring ${m.type} message.`);
          return;
        }

        if (result !== null) {
          // eslint-disable-next-line no-console
          console.error(`Result already returned, ignoring ${m.type} message.`);
          return;
        }

        result = m.result;
        clearTimeout(kto);
        resolve(result);
        childProcess.kill();
        break;
      }
      case 'chunk': {
        if (result !== null) {
          // eslint-disable-next-line no-console
          console.error(`Result already returned, ignoring ${m.type} message.`);
          return;
        }

        if (streamEnded) {
          // eslint-disable-next-line no-console
          console.error(`Stream already closed, ignoring ${m.type} message.`);
          return;
        }

        if (scriptResponseStream === null) {
          scriptResponseStream = new ChildResponseReceiver(childProcess);
          resolve(scriptResponseStream);
        }

        if (backpressure) {
          // childProcess does not respect downstream backpressure entirely, it respects its own highwatermark buffer before backpressure kick in, so we're forced to buffer here too in case if downstream reader signals backpressure before the upstream highwatermark has been reached
          scriptResponseStream.buffer(m.chunk);
        } else if (scriptResponseStream.push(m.chunk)) {
          childProcess.send({ ack: 1 });
        } else {
          backpressure = true;
          scriptResponseStream.buffer(m.chunk);
        }

        lastStreamedLogDate = new Date();
        break;
      }
      case 'finished': {
        if (streamEnded) {
          // eslint-disable-next-line no-console
          console.error(`Stream already closed, ignoring ${m.type} message.`);
          return;
        }

        streamEnded = true;
        clearTimeout(kto);
        if (scriptResponseStream === null) {
          scriptResponseStream = new ChildResponseReceiver(childProcess);
          resolve(scriptResponseStream);
        }
        scriptResponseStream.push(null);
        childProcess.kill();
        break;
      }
      case 'stdout': {
        scriptLogger(m.name, m.message);
        break;
      }
      case 'error': {
        clearTimeout(kto);
        // eslint-disable-next-line max-len
        const err = new ScriptExecError(scriptId, fun, m.error.name, m.error.message, m.error.stack);
        if (scriptResponseStream === null) {
          reject(err);
        } else {
          scriptResponseStream.destroy(err);
        }
        streamEnded = true;
        childProcess.kill();
        break;
      }
      default:
        // eslint-disable-next-line no-console
        console.error('Unexpected message type from child', m);
        break;
    }
  });
  childProcess.on('error', (err) => {
    clearTimeout(kto);
    const e = new ScriptHaltError(scriptId, fun, err.message);
    if (scriptResponseStream === null) {
      reject(e);
    } else {
      scriptResponseStream.destroy(e);
    }
    streamEnded = true;
  });
  childProcess.on('disconnect', () => {
    clearTimeout(kto);
    const err = new ScriptHaltError(scriptId, fun, 'disconnected');
    if (scriptResponseStream === null) {
      reject(err);
    } else {
      scriptResponseStream.destroy(err);
    }
    streamEnded = true;
  });
  childProcess.on('exit', (c) => {
    clearTimeout(kto);
    const err = new ScriptHaltError(scriptId, fun, `exit code ${c}`);
    if (scriptResponseStream === null) {
      reject(err);
    } else {
      scriptResponseStream.destroy(err);
    }
    streamEnded = true;
  });
  childProcess.send({
    scriptData,
    fun,
    args,
  });
});
