const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const { Transform } = require('stream');
const { runScript } = require('../../utils/script-runner');
const { stringify } = require('../../utils/script-utils');

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
    super({ readableOjectMode: false, writableObjectMode: true });
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

module.exports = async (req, res) => {
  const scriptStdOut = [];
  const scriptPath = path.resolve(process.cwd(), req.body.script);
  try {
    if (!await fse.pathExists(scriptPath || '')) {
      const message = `Unable to find file ${scriptPath}, please check the path in context.yaml`;
      res.set('Content-Type', 'application/json');
      res.status(421)
        .send(Response.error({ message }));

      return;
    }

    const scriptData = fse.readFileSync(scriptPath);

    const scriptLogger = (name, log) => {
      log.split(/\r\n|\n\r|\n|\r/)
        .forEach((logPart) => {
          scriptStdOut.push({
            name,
            message: logPart,
          });
        });
    };

    const {
      download = false,
    } = req.body.opts || {};

    // eslint-disable-next-line max-len
    const stream = await runScript(scriptPath, scriptData.toString(), req.body.function, [req.body.params], scriptLogger);

    res.set('Content-Type', 'application/json');

    if (download) {
      const logpath = `${process.cwd()}/action.log`;
      const destination = fs.createWriteStream(logpath);
      stream
        .pipe(new PayloadTransform())
        .pipe(destination)
        .on('finish', () => {
          res.status(200)
            .send(Response.success(
              [{ timestamp: new Date().getTime(), log: `Logs downloaded at ${logpath}` }],
              scriptStdOut,
            ));
        });
    } else {
      res.write('{"payload":');

      const payload = stream.pipe(new PayloadTransform());

      payload.pipe(res, { end: false });

      payload.on('end', () => {
        res.write(',"logs":[');
        scriptStdOut.forEach((log, i) => {
          if (i > 0) {
            res.write(',');
          }
          res.write(JSON.stringify(log));
        });
        res.write(']}');

        res.end();
      });
    }
  } catch (e) {
    if (e == null) {
      return;
    }
    try {
      res.status(420)
        .send(Response.error(stringify(e), scriptStdOut));
    } catch (ee) {
      // we may not be able to sent a proper http error response, as the response may have been already started to be streamed.
      // eslint-disable-next-line no-console
      console.error('Unexpected http response error', ee, '. Script error is:', e);
    }
  }
};
