const chalk = require('chalk');
const { DEFAULT_PORT, ERROR_CODE } = require('../constants');
const { error, success, info } = require('../utils/output');
const server = require('../server');
const isRoot = require('../validators/isRoot');

module.exports = async ({ port = DEFAULT_PORT }) => {
  // Check if the user is in a technology folder.
  if (!await isRoot()) {
    error('fatal: not a technology folder');
    process.exit(ERROR_CODE.NOT_A_TECHNOLOGY_FOLDER);
  }

  if (process.env.SAAGIE_ENV === 'development') {
    info('Running in DEVELOPMENT');
  }

  const { port: serverPort } = server({ port });
  success(chalk`🚀  Server running on {underline http://localhost:${serverPort}}`);
};
