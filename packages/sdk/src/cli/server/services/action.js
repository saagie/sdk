// eslint-disable-next-line max-classes-per-file
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const {
  Transform,
  Readable,
} = require('stream');
const { runScript } = require('../../utils/script-runner');
const { stringify } = require('../../utils/script-utils');
const { ScriptExecError } = require('../../utils/errors');

const Response = {
  success: (payload, logs) => ({
    payload,
    logs,
  }),
  error: (error, logs) => ({
    error,
    logs,
  }),
};

class PayloadTransform extends Transform {
  constructor() {
    super({
      readableOjectMode: false,
      writableObjectMode: true,
    });
    this.empty = true;
  }

  _transform(chunk, _, callback) {
    if (this.empty) {
      this.empty = false;
      this.push('[');
    } else {
      this.push(',');
    }
    this.push(JSON.stringify(chunk));
    callback();
  }

  _flush(callback) {
    if (this.empty) {
      this.push('[');
    }
    this.push(']');
    callback();
  }
}

class LogTransform extends Transform {
  constructor() {
    super({
      readableOjectMode: false,
      writableObjectMode: true,
    });
  }

  _transform(chunk, _, callback) {
    this.push(new Date(chunk.timestamp).toISOString());
    this.push(': ');
    this.push(chunk.log);
    this.push('\n');
    callback();
  }
}

class BufferHeadTransform extends Transform {
  constructor(max) {
    super({
      readableOjectMode: true,
      writableObjectMode: true,
      objectMode: true,
    });
    this.max = max;
    this.head = [];
    this.hasMore = false;
  }

  _transform(chunk, _, callback) {
    if (this.head.length < this.max) {
      this.head.push(chunk);
    } else {
      this.hasMore = true;
    }
    this.push(chunk);
    callback();
  }
}

module.exports = async (req, res) => {
  const scriptPath = path.resolve(process.cwd(), req.body.script);

  const logs = [];
  const scriptLogger = (name, log) => {
    log.split(/\r\n|\n\r|\n|\r/).forEach((logPart) => {
      logs.push({ name, log: logPart });
    });
  };

  try {
    if (!await fse.pathExists(scriptPath || '')) {
      const message = `Unable to find file ${scriptPath}, please check the path in context.yaml`;
      res.set('Content-Type', 'application/json');
      res.status(421)
        .send(Response.error({ message }));

      return;
    }

    const scriptData = fse.readFileSync(scriptPath);

    const {
      download = false,
    } = req.body.opts || {};

    try {
      let result = await runScript(
        scriptPath,
        scriptData.toString(),
        req.body.function,
        [req.body.params],
        scriptLogger,
      );

      if (result instanceof Readable) {
        let downloadLink = null;
        let hasMore = null;
        if (download) {
          const logpath = `${process.cwd()}/action.log`;
          downloadLink = {
            href: '/api/static?path=action.log',
            name: 'action.log',
          };
          const destination = fs.createWriteStream(logpath);
          const head = new BufferHeadTransform(100);
          await new Promise((fulfill) => {
            result
              .pipe(head)
              .pipe(new LogTransform())
              .pipe(destination)
              .on('finish', fulfill);
          });
          hasMore = head.hasMore;
          result = Readable.from(head.head);
        }
        res.write('{"payload":');

        const payload = result.pipe(new PayloadTransform());

        payload.pipe(res, { end: false });

        payload.on('end', () => {
          res.write(',"logs":[');
          logs.forEach((log, i) => {
            if (i > 0) {
              res.write(',');
            }
            res.write(JSON.stringify(log));
          });
          res.write(']');
          if (downloadLink !== null) {
            res.write(',"download":');
            res.write(JSON.stringify(downloadLink));
          }
          if (hasMore !== null) {
            res.write(',"hasMore":');
            res.write(hasMore ? 'true' : 'false');
          }
          res.write('}');
          res.end();
        });
      } else {
        res.set('Content-Type', 'application/json');
        res.send({
          payload: result,
          logs,
        });
      }
    } catch (e) {
      if (e == null) {
        // eslint-disable-next-line no-console
        console.error(`Unexpected error running script ${scriptPath}: ${e}`);
      } else if (e instanceof ScriptExecError) {
        // eslint-disable-next-line no-console
        console.warn(`Script ${scriptPath} execution error: ${e.name} / ${e.message} / ${e.stack}`);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Unexpected error running script ${scriptPath}: ${e}`, e);
      }
    }
  } catch (e) {
    if (e == null) {
      return;
    }
    try {
      res.status(420)
        .send(Response.error(stringify(e), logs));
    } catch (ee) {
      // we may not be able to sent a proper http error response, as the response may have been already started to be streamed.
      // eslint-disable-next-line no-console
      console.error('Unexpected http response error', ee, '. Script error is:', e);
    }
  }
};
