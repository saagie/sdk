const path = require('path');
const globby = require('globby');
const Parcel = require('parcel-bundler');
const { build } = require('esbuild');
const { BUILD_FOLDER, BUNDLERS } = require('../constants');
const { error } = require('./output');

exports.buildJS = async () => {
  const paths = await globby(['./**/*.js', `!${BUILD_FOLDER}`, '!node_modules']);

  switch (global.bundler) {
    case BUNDLERS.ESBUILD: {
      try {
        paths.forEach(async (jsPath) => build({
          entryPoints: [jsPath],
          outfile: path.resolve(BUILD_FOLDER, jsPath),
          platform: 'node',
          minify: true,
          bundle: true,
        }));
      } catch (err) {
        error(err);
      }
      break;
    }
    default: {
      const parcel = new Parcel(
        paths,
        {
          outDir: BUILD_FOLDER,
          minify: true,
          watch: false,
          target: 'node',
          bundleNodeModules: true,
          sourceMaps: false,
          autoInstall: false,
          logLevel: 2,
        },
      );

      try {
        await parcel.bundle();
      } catch (err) {
        error(err);
      }
    }
  }
};
