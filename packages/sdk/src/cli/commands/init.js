const inquirer = require('inquirer');
const yaml = require('yaml');
const fse = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const slugify = require('slugify');
const { version } = require('../../../package.json');

const isRoot = require('../validators/isRoot');
const output = require('../utils/output');
const { CONTEXT, TECHNOLOGY, ERROR_CODE } = require('../constants');

const isRequired = (message) => (input) => (input && input.length !== 0 ? true : (message || 'Please provide a value'));

async function interactivelyCreateTechnologyFile() {
  if (await isRoot()) {
    output.log(chalk.bold('ℹ️  This folder already contains a technology.yaml file.'));
    output.info('    ↳ Technology creation skipped');
    return {};
  }

  output.log(chalk.bold('👇 New technology'));

  const answers = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'label',
        default: 'My Technology',
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'id',
        message: 'id',
        default: ({ label }) => slugify(label, { lower: true, strict: true }),
        filter: (input) => slugify(input, { lower: true, strict: true }),
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'description',
        message: 'description',
      },
      {
        type: 'confirm',
        name: 'useDefaultFolder',
        message: ({ id }) => `Generate in ./${id}`,
      },
      {
        type: 'input',
        name: 'folder',
        prefix: '↳',
        message: 'Folder',
        default: ({ id }) => `./${id}`,
        when: ({ useDefaultFolder }) => !useDefaultFolder,
      },
    ]);

  const technologyConfig = {
    version: 'v1',
    id: answers.id,
    label: answers.label,
    available: true,
    description: answers.description,
    type: 'JOB',
    logo: './logo.png',
  };

  const technolgyFolder = answers.useDefaultFolder ? answers.id : answers.folder;
  fse.outputFileSync(path.resolve(process.cwd(), `${technolgyFolder}/${TECHNOLOGY.FILENAME}.yaml`), yaml.stringify(technologyConfig));

  output.success(`🎉 ${answers.label} created!`);

  return answers;
}

async function interactivelyCreateContext() {
  output.log(chalk.bold('👇 New context'));

  const contextAnswers = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Identifier (will create a folder with the given value)',
        validate: async (input) => {
          if (!input || !input.length === 0) {
            return 'Please provide a value';
          }

          // TODO: Check for every context.yaml id instead of folders.
          if (await fse.pathExists(input)) {
            return `Context ${input} already exists`;
          }

          return true;
        },
      },
      {
        type: 'input',
        name: 'label',
        message: 'Label',
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
      },
      {
        type: 'confirm',
        name: 'available',
        message: (currentAnswers) => `Is the context ${currentAnswers.label} available to Saagie users ?`,
      },
      {
        type: 'confirm',
        name: 'recommended',
        message: (currentAnswers) => `Is the context ${currentAnswers.label} recommended ?`,
      },
      {
        type: 'input',
        name: 'trustLevel',
        message: 'Level of trust',
      },
    ]);

  const { id } = contextAnswers;

  try {
    await fse.ensureDir(id);
  } catch (err) {
    output.error(`Unable to create context folder for name ${id}`);
    process.exit(ERROR_CODE.CONTEXT_FOLDER_NOT_CREATED);
  }

  fse.outputFileSync(
    path.resolve(process.cwd(), id, `${CONTEXT.FILENAME}.yaml`),
    yaml.stringify(contextAnswers),
  );

  output.success(`Context "${id}" created`);
}

module.exports = async () => {
  output.log(`Saagie 📦 SDK - v${version}`);
  await interactivelyCreateTechnologyFile();
  await interactivelyCreateContext();

  output.success('\nInitialization done');
};
