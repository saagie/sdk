const fse = require('fs-extra');
const path = require('path');
const { Stream } = require('stream');
const output = require('../../utils/output');
const { stringify, runScript } = require('../../utils/runScript');

const Response = {
  success: (data, logs) => ({
    data,
    logs,
  }),
  error: (error, logs) => ({
    error,
    logs,
  }),
};

function onError(error, res, logs) {
  output.error(error);
  res.status(420).send(Response.error(stringify(error), logs));
}

module.exports = async (req, res) => {
  const logs = [];
  try {
    const scriptPath = path.resolve(process.cwd(), req.body.script);

    if (!await fse.pathExists(scriptPath || '')) {
      const message = `Unable to find file ${scriptPath}, please check the path in context.yaml`;
      output.error(message);
      res.status(421).send(Response.error({ message }));

      return;
    }

    const logger = (log) => logs.push(log);
    const scriptData = fse.readFileSync(scriptPath);
    const data = await runScript(scriptData, req.body.function, req.body.params, logger);
    if (data instanceof Stream) {
      data.pause();
      data.on('error', (err) => onError(err, res, logs));
      data.pipe(res);
    } else {
      res.send(Response.success(data, logs));
    }
  } catch (err) {
    onError(err, res, logs);
  }
};
