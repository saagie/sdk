/* eslint-disable no-console */
const chalk = require('chalk');

exports.success = (output) => console.log(chalk.bold.green(output));
exports.warning = (output) => console.log(chalk.yellow(output));
exports.error = (output) => console.log(chalk.bold.red(output));
exports.info = (output) => console.log(chalk.blue(output));
exports.log = (output) => console.log(output);
