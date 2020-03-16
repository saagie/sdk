const Parcel = require('parcel-bundler');
const path = require('path');
const { Response } = require('../../../sdk');

const { error } = require('../../utils/output');
const { BUNDLE_FOLDER } = require('../../constants');

module.exports = async (req, res) => {
  try {
    const scriptPath = path.resolve(process.cwd(), req.body.script);
    console.log(scriptPath);

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
    const importedScript = require(bundle.name);

    const data = await importedScript[req.body.function || 'default'](req.body.params);

    if (data.status === 'ERROR') {
      res.status(500);
    }

    if (data.status === 'EMPTY') {
      res.status(400);
    }

    res.send(data);
  } catch (err) {
    error(err);

    res.status(500).send(Response.error(err.message, { error: err.stack }));
  }
};
