const path = require('path');
const globby = require('globby');
const { build } = require('esbuild');
const { BUILD_FOLDER } = require('../constants');
const { error } = require('./output');

exports.buildJS = async () => {
  const paths = await globby(['./**/*.js', `!${BUILD_FOLDER}`, '!node_modules']);

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
};
