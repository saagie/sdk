#!/usr/bin/env node

const program = require('commander');
const semver = require('semver');
const figures = require('figures');

const init = require('./commands/init');
const start = require('./commands/start');
const output = require('./utils/output');
const { ERROR_CODE } = require('./constants');

const { version, engines } = require('../../package.json');

if (!semver.satisfies(process.version, engines.node)) {
  output.error(`${figures.warning} Your node version ${process.version} is not supported, please use ${engines.node}`);

  process.exit(ERROR_CODE.NODE_VERSION_NOT_SUPPORTED);
}

program.version(version);

program.command('init')
  .description('Create an empty Saagie External Technology project')
  .action(init);

program.command('start')
  .option('-p, --port <port>', 'The port to use')
  .description('Run local application')
  .action(start);

// Output error and help on unknown command.
program.on('command:*', () => {
  output.error(`invalid command: ${program.args.join(' ')}`);
  program.outputHelp();
  process.exit(ERROR_CODE.INVALID_COMMAND);
});

program.parse(process.argv);
