const { fork } = require('child_process');
const path = require('path');
const { ScriptExecError, ScriptHaltError } = require('./errors');

const idleChildProcessTimeout = 10 * 1000; // FIXME: to be retrieve from conf
const maxChildProcessTimeout = 60 * 1000; // FIXME: to be retrieve from conf

// eslint-disable-next-line max-len
exports.runScript = async (scriptId, scriptData, fun, args, scriptLogger, stream) => new Promise((resolve, reject) => {
  // https://github.com/patriksimek/vm2/issues/355
  // this function can safely be used from the main process. sandbox is limited to JSON values
  const childRunnerFile = path.resolve(__dirname, 'script-runner-child');
  const childProcess = fork(childRunnerFile, [], {
    env: {},
    execArgv: [],
  });
  const startDate = new Date();
  let lastStreamedLogDate = null;
  const childProcessStdOut = [];
  let kto = null;
  function setupKillTimeout(timeout) {
    return setTimeout(() => {
      if (lastStreamedLogDate == null) {
        childProcess.kill(9);
      } else {
        const now = new Date();
        const totalDurationTime = now.getTime() - startDate.getTime();
        if (totalDurationTime > maxChildProcessTimeout) {
          childProcess.kill(9);
        } else {
          const timeWithoutChunk = now.getTime() - lastStreamedLogDate.getTime();
          if (timeWithoutChunk > timeout) {
            childProcess.kill(9);
          } else {
            kto = setupKillTimeout(idleChildProcessTimeout - timeWithoutChunk);
          }
        }
      }
    }, timeout);
  }

  kto = setupKillTimeout(idleChildProcessTimeout);
  childProcess.on('message', (m) => {
    if (m.type === 'result') {
      clearTimeout(kto);
      resolve({ content: m.result ? JSON.parse(m.result) : null });
      childProcess.kill();
    } else if (m.type === 'log') {
      childProcess.send({ ack: 1 });

      if (lastStreamedLogDate == null) {
        // not very MVC, but we're respecting here the format of 'Response.success' of the HTTP API
        stream.write('{"data":[');
      } else {
        stream.write(',');
      }

      lastStreamedLogDate = new Date();
      stream.write(JSON.stringify(m.log));
    } else if (m.type === 'finished') {
      clearTimeout(kto);

      // no chunks received, prefix missing, let's add it
      if (lastStreamedLogDate == null) {
        stream.write('{"data":[');
      }
      stream.write('],"logs":[');

      childProcessStdOut.forEach((log, i) => {
        if (i > 0) {
          stream.write(',');
        }
        stream.write(JSON.stringify(log));
      });
      stream.write(']}');

      stream.end();
      resolve(null);
      childProcess.kill();
    } else if (m.type === 'stdout') {
      if (lastStreamedLogDate != null) {
        childProcessStdOut.push(m);
      } else {
        // get stdouts stored before log streaming (before lastStreamedLogDate became non null), if any
        while (childProcessStdOut.length > 0) {
          const { name, message } = childProcessStdOut.shift();
          scriptLogger(name, message);
        }
        scriptLogger(m.name, m.message);
      }
    } else if (m.type === 'error') {
      clearTimeout(kto);
      if (lastStreamedLogDate != null) {
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
    if (lastStreamedLogDate != null) {
      stream.end();
    }
    reject(new ScriptHaltError(scriptId, fun, err.message));
  });
  childProcess.on('disconnect', () => {
    clearTimeout(kto);
    if (lastStreamedLogDate != null) {
      stream.end();
    }
    reject(new ScriptHaltError(scriptId, fun, 'disconnected'));
  });
  childProcess.on('exit', (c) => {
    clearTimeout(kto);
    if (lastStreamedLogDate != null) {
      stream.end();
    }
    if (c !== 0) {
      reject(new ScriptHaltError(scriptId, fun, `exit code ${c}`));
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
