const globby = require('globby');

const { TECHNOLOGY } = require('../constants');

module.exports = async () => {
  const files = await globby([`./${TECHNOLOGY.FILENAME_GLOB}`]);

  return files.length === 1;
};
