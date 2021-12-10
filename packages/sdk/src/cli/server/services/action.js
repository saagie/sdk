const fse = require('fs-extra');
const path = require('path');
const { Stream } = require('stream');
const output = require('../../utils/output');
const { runScript } = require('../../utils/runScript');

const Response = {
  success: (data) => ({
    status: 'SUCCESS',
    data,
  }),
  empty: (message) => ({
    status: 'EMPTY',
    message,
  }),
  error: (message, { error }) => ({
    status: 'ERROR',
    message,
    error,
  }),
};

function onError(err, res) {
  output.error(err);
  res.status(500).send(Response.error(err.message, { error: err.stack }));
}

module.exports = async (req, res) => {
  try {
    const scriptPath = path.resolve(process.cwd(), req.body.script);

    if (!await fse.pathExists(scriptPath || '')) {
      const message = `Unable to find file ${scriptPath}, please check the path in context.yaml`;
      output.error(message);
      res.status(500).send(Response.error(message, { error: message }));

      return;
    }

    const scriptData = fse.readFileSync(scriptPath);
    const data = await runScript(scriptData, req.body.function, req.body.params);
    if (data instanceof Stream) {
      data.pause();
      data.on('error', (err) => onError(err, res));
      data.pipe(res);
    } else {
      res.send(Response.success(data));
    }
  } catch (err) {
    onError(err, res);
  }
};
