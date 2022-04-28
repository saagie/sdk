// eslint-disable-next-line max-classes-per-file
const { fork } = require('child_process');
const path = require('path');

class ScriptExecError extends Error {
  constructor(scriptId, fun, name, message, stack) {
    super(message);
    this.scriptId = scriptId;
    this.fun = fun;
    this.name = name;
    this.message = message;
    this.stack = stack;
  }
}
exports.ScriptExecError = ScriptExecError;

const childProcessTimeout = 10000; // FIXME: to be retrieve from conf

// eslint-disable-next-line max-len
exports.runScript = async (scriptId, scriptData, fun, args, scriptLogger, stream) => new Promise((resolve, reject) => {
  // https://github.com/patriksimek/vm2/issues/355
  // this function can safely be used from the main process. sandbox is limited to JSON values
  const childRunnerFile = path.resolve(__dirname, 'script-runner-child');
  const childProcess = fork(childRunnerFile, [], {
    env: {},
    execArgv: [],
  });
  let lastStreamedChunkDate = null;
  const streamedLogs = [];

  function setupKillTimeout(timeout) {
    return setTimeout(() => {
      if (lastStreamedChunkDate == null) {
        childProcess.kill(9);
      } else {
        const now = new Date();
        const timeWithoutChunk = now.getTime() - lastStreamedChunkDate.getTime();
        if (timeWithoutChunk > timeout) {
          childProcess.kill(9);
        } else {
          // eslint-disable-next-line no-use-before-define
          kto = setupKillTimeout(childProcessTimeout - timeWithoutChunk);
        }
      }
    }, timeout);
  }

  let kto = setupKillTimeout(childProcessTimeout);
  childProcess.on('message', (m) => {
    if (m.type === 'result') {
      clearTimeout(kto);
      resolve({ content: JSON.parse(m.result) });
      childProcess.kill();
    } else if (m.type === 'chunk') {
      childProcess.send({ ack: 1 });
      if (lastStreamedChunkDate == null) {
        // not very MVC, but we're respecting here the format of 'Response.success' of the HTTP API
        stream.write('{"data":[');
      } else {
        stream.write(',');
      }
      lastStreamedChunkDate = new Date();
      stream.write(JSON.stringify(m.chunk));
    } else if (m.type === 'finished') {
      clearTimeout(kto);
      if (lastStreamedChunkDate != null) {
        stream.write('],"logs":[');
        streamedLogs.forEach((log, i) => {
          if (i > 0) {
            stream.write(',');
          }
          stream.write(JSON.stringify(log));
        });
        stream.write(']}');
        stream.end();
      }
      resolve(null);
      childProcess.kill();
    } else if (m.type === 'log') {
      if (lastStreamedChunkDate != null) {
        streamedLogs.push(m);
      } else {
        scriptLogger(m.name, m.message);
      }
    } else if (m.type === 'error') {
      clearTimeout(kto);
      if (lastStreamedChunkDate != null) {
        stream.end();
      }
      reject(new ScriptExecError(scriptId, fun, m.error.name, m.error.message, m.error.stack));
      childProcess.kill();
    } else {
      // eslint-disable-next-line no-console
      console.error('Unexpected message type from child', m);
    }
  });
  childProcess.on('error', (err) => {
    clearTimeout(kto);
    if (lastStreamedChunkDate != null) {
      stream.end();
    }
    reject(new ScriptExecError(scriptId, fun, 'ScriptHaltError', err.message, null));
  });
  childProcess.on('disconnect', () => {
    clearTimeout(kto);
    if (lastStreamedChunkDate != null) {
      stream.end();
    }
    reject(new ScriptExecError(scriptId, fun, 'ScriptHaltError', 'disconnected', null));
  });
  childProcess.on('exit', (c) => {
    clearTimeout(kto);
    if (lastStreamedChunkDate != null) {
      stream.end();
    }
    if (c !== 0) {
      reject(new ScriptExecError(scriptId, fun, 'ScriptHaltError', `exit code ${c}`, null));
    }
  });
  childProcess.send({ scriptData, fun, args });
});

class Result {
  constructor(content) {
    this.content = content;
  }
}
exports.Result = Result;
