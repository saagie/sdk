const { ERROR_CODE, BUILD_FOLDER, TECHNOLOGY } = require('../constants');
const { error, info } = require('../utils/output');
const isRoot = require('../validators/isRoot');
const isFileEmpty = require('../validators/isFileEmpty');
const isYAMLFileValid = require('../validators/isYAMLFileValid');
const { generateMetadataFile } = require('../utils/yaml');
const { buildJS } = require('../utils/bundler');

module.exports = async () => {
  // Check if the user is in a technology folder.
  if (!await isRoot()) {
    error('fatal: not a technology folder');
    process.exit(ERROR_CODE.NOT_A_TECHNOLOGY_FOLDER);
  }

  // Make sure that technology yaml file is not empty.
  if (await isFileEmpty(TECHNOLOGY.FILENAME_GLOB)) {
    error('fatal: technology yaml file is empty');
    process.exit(ERROR_CODE.TECHNOLOGY_YAML_IS_EMPTY);
  }

  // Make sure that technology yaml file is valid.
  if (!await isYAMLFileValid(TECHNOLOGY.FILENAME_GLOB)) {
    error('fatal: technology yaml file is not valid');
    process.exit(ERROR_CODE.TECHNOLOGY_YAML_IS_NOT_VALID);
  }

  await generateMetadataFile();
  await buildJS();

  info(`Build done in ${BUILD_FOLDER} folder`);
};
