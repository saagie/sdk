const fse = require('fs-extra');
const path = require('path');
const Parcel = require('parcel-bundler');
const { build } = require('esbuild');
const { Response } = require('../../../sdk');

const output = require('../../utils/output');
const { BUNDLE_FOLDER, BUNDLERS } = require('../../constants');

const ENGINES = {
  parcel: async (scriptPath, outFile) => {
    const parcel = new Parcel(
      scriptPath,
      {
        outDir: path.resolve(process.cwd(), BUNDLE_FOLDER),
        outFile,
        minify: true,
        watch: false,
        target: 'node',
        bundleNodeModules: true,
        sourceMaps: false,
        autoInstall: false,
      },
    );

    const bundle = await parcel.bundle();
    return bundle.name;
  },
  esbuild: async (scriptPath, outfile) => {
    await build({
      entryPoints: [scriptPath],
      outfile,
      platform: 'node',
      minify: true,
      bundle: true,
      sourcemap: true,
    });

    return outfile;
  },
};

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
