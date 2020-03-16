const globby = require('globby');
const Parcel = require('parcel-bundler');
const { BUILD_FOLDER } = require('../constants');
const { error } = require('./output');

exports.buildJS = async () => {
  const paths = await globby(['./**/*.js', `!${BUILD_FOLDER}`, '!node_modules']);

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
};
