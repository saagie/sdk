#!/usr/bin/env node

const program = require('commander');

const init = require('./commands/init');
const start = require('./commands/start');
const build = require('./commands/build');
const { error } = require('./utils/output');
const { ERROR_CODE } = require('./constants');

const { version } = require('../../package.json');

program.version(version);

program.command('init')
  .description('Create an empty Saagie External Technology project')
  .action(init);

program.command('start')
  .option('-p, --port <port>', 'The port to use')
  .description('Run local application')
  .action(start);

program.command('build')
  .description('Package your technology')
  .action(build);

// Output error and help on unknown command.
program.on('command:*', () => {
  error(`invalid command: ${program.args.join(' ')}`);
  program.outputHelp();
  process.exit(ERROR_CODE.INVALID_COMMAND);
});

program.parse(process.argv);
