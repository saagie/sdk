const path = require('path');
const Parcel = require('parcel-bundler');
const { build } = require('esbuild');
const { BUNDLE_FOLDER } = require('../constants');

exports.ENGINES = {
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
