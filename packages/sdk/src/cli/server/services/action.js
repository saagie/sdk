const fse = require('fs-extra');
const path = require('path');
const { Response } = require('../../../sdk');
const output = require('../../utils/output');
const { ENGINES } = require('../../utils/engines');
const { BUNDLE_FOLDER, BUNDLERS } = require('../../constants');

module.exports = async (req, res) => {
  try {
    const scriptPath = path.resolve(process.cwd(), req.body.script);

    if (!await fse.pathExists(scriptPath || '')) {
      const message = `Unable to find file ${scriptPath}, please check the path in context.yaml`;
      output.error(message);
      res.status(500).send(Response.error(message, { error: message }));

      return;
    }

    const outfile = path.resolve(process.cwd(), BUNDLE_FOLDER, path.basename(req.body.script));

    const engine = ENGINES[global.bundler] || ENGINES[BUNDLERS.PARCEL];

    const bundleName = await engine(scriptPath, outfile);

    // eslint-disable-next-line security/detect-object-injection
    delete require.cache[bundleName];

    // We need this non literal require so we can execute the given script.
    // eslint-disable-next-line security/detect-non-literal-require
    const importedScript = require(bundleName);

    const data = await importedScript[req.body.function || 'default'](req.body.params);

    switch (data.status) {
      case 'ERROR':
        res.status(500).send(data);
        break;
      case 'EMPTY':
        res.status(400).send(data);
        break;
      default:
        res.send(data);
    }
  } catch (err) {
    output.error(err);

    res.status(500).send(Response.error(err.message, { error: err.stack }));
  }
};
