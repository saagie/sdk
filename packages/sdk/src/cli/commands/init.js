const inquirer = require('inquirer');
const yaml = require('yaml');
const fse = require('fs-extra');
const path = require('path');

const output = require('../utils/output');
const { CONTEXT, TECHNOLOGY, ERROR_CODE } = require('../constants');

async function interactivelyCreateTechnologyFile() {
  output.log('Technology form');

  const answers = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'version',
        message: 'Version',
      },
      {
        type: 'input',
        name: 'id',
        message: 'Identifier (id)',
      },
      {
        type: 'input',
        name: 'label',
        message: 'Label',
      },
      {
        type: 'input',
        name: 'minimumProductVersion',
        message: 'Minimum Product Version',
      },
      {
        type: 'input',
        name: 'type',
        message: 'Type',
      },
      {
        type: 'input',
        name: 'logo',
        message: 'Path to the logo of the technology',
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
  fse.outputFileSync(path.resolve(process.cwd(), `${TECHNOLOGY.FILENAME}.yml`), technologyContent);
}

async function interactivelyCreateContext() {
  output.log('\nCreate your first context for the technology:\n');

  const { contextName } = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'contextName',
        message: 'Context folder name',
      },
    ]);

  if (await fse.pathExists(contextName)) {
    output.warning('Context folder already exists');
    process.exit();
  }

  const contextAnswers = await inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'Label',
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

  try {
    await fse.ensureDir(contextName);
  } catch (err) {
    output.error(`Unable to create context folder for name ${contextName}`);
    process.exit(ERROR_CODE.CONTEXT_FOLDER_NOT_CREATED);
  }

  fse.outputFileSync(
    path.resolve(process.cwd(), contextName, `${CONTEXT.FILENAME}.yml`),
    yaml.stringify({
      id: contextName,
      ...contextAnswers,
    }),
  );
}

module.exports = async () => {
  await interactivelyCreateTechnologyFile();
  await interactivelyCreateContext();

  output.success('Initialization done');
};
