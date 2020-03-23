const fse = require('fs-extra');
const path = require('path');
const Parcel = require('parcel-bundler');
const { Response } = require('../../../sdk');

const output = require('../../utils/output');
const { BUNDLE_FOLDER } = require('../../constants');

module.exports = async (req, res) => {
  try {
    const scriptPath = path.resolve(process.cwd(), req.body.script);


    if (!await fse.pathExists(scriptPath || '')) {
      const message = `Unable to find file ${scriptPath}, please check the path in context.yaml`;
      output.error(message);
      res.status(500).send(Response.error(message, { error: message }));
      return;
    }

    const parcel = new Parcel(
      scriptPath,
      {
        outDir: path.resolve(process.cwd(), BUNDLE_FOLDER),
        outFile: `${req.body.script.split('.').slice(0, -1).join('.')}.js`,
        minify: true,
        watch: false,
        target: 'node',
        bundleNodeModules: true,
        sourceMaps: false,
        autoInstall: false,
      },
    );

    const bundle = await parcel.bundle();

    delete require.cache[bundle.name];

    // We need this non literal require so we can execute the given script.
    // eslint-disable-next-line security/detect-non-literal-require
    const importedScript = require(bundle.name);

    const data = await importedScript[req.body.function || 'default'](req.body.params);

    switch (data.status) {
      case 'ERROR':
        res.status(500);
        break;
      case 'EMPTY':
        res.status(400);
        break;
      default:
        res.send(data);
    }
  } catch (err) {
    output.error(err);

    res.status(500).send(Response.error(err.message, { error: err.stack }));
  }
};
