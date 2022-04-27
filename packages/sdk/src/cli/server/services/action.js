const fse = require('fs-extra');
const path = require('path');
const { runScript } = require('../../utils/script-runner');
const { stringify } = require('../../utils/script-utils');

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

module.exports = async (req, res) => {
  const logs = [];
  let result = null;
  const scriptPath = path.resolve(process.cwd(), req.body.script);
  try {
    if (!await fse.pathExists(scriptPath || '')) {
      const message = `Unable to find file ${scriptPath}, please check the path in context.yaml`;
      res.status(421)
        .send(Response.error({ message }));

      return;
    }

    const scriptData = fse.readFileSync(scriptPath);

    const scriptLogger = (name, log) => {
      log.split(/\r\n|\n\r|\n|\r/)
        .forEach((logPart) => {
          logs.push({
            name,
            message: logPart,
          });
        });
    };
    // eslint-disable-next-line max-len
    result = await runScript(scriptPath, scriptData.toString(), req.body.function, [req.body.params], scriptLogger, res);
  } catch (e) {
    if (e == null) {
      return;
    }
    res.status(420).send(Response.error(stringify(e), logs));
  }
  if (result != null) {
    res.set('Content-Type', 'application/json');
    res.send(Response.success(result.content, logs));
  }
};
