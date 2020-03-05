const inquirer = require('inquirer');
const yaml = require('yaml');
const fse = require('fs-extra');
const path = require('path');

const isRoot = require('../validators/isRoot');
const output = require('../utils/output');
const { CONTEXT, TECHNOLOGY, ERROR_CODE } = require('../constants');

function validateInput(input) {
  return input && input.length !== 0 ? true : 'Please provide a value';
}

async function interactivelyCreateTechnologyFile() {
  if (await isRoot()) {
    output.warning('Technology exists');
    return;
  }

  output.log('Technology form');

  const answers = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'version',
        message: 'Version',
        choices: [
          'v1',
        ],
      },
      {
        type: 'input',
        name: 'id',
        message: 'Identifier',
        validate: validateInput,
      },
      {
        type: 'input',
        name: 'label',
        message: 'Label',
        validate: validateInput,
      },
      {
        type: 'list',
        name: 'type',
        message: 'Type',
        choices: [
          'JOB',
        ],
      },
      {
        type: 'input',
        name: 'logo',
        message: 'The logo path',
      },
      {
        type: 'confirm',
        name: 'available',
        message: 'Is the technology available?',
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
      },
    ]);

  const technologyContent = yaml.stringify(answers);
  fse.outputFileSync(path.resolve(process.cwd(), `${TECHNOLOGY.FILENAME}.yaml`), technologyContent);
}

async function interactivelyCreateContext() {
  output.log('\nCreate a context for the technology:\n');

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
        validate: validateInput,
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
  await interactivelyCreateTechnologyFile();
  await interactivelyCreateContext();

  output.success('\nInitialization done');
};
