const inquirer = require('inquirer');
const yaml = require('yaml');
const fs = require('fs-extra');
const path = require('path');

const { info } = require('../utils/output');
const { TECHNOLOGY } = require('../constants');

module.exports = async () => {
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
  fs.outputFileSync(path.resolve(process.cwd(), `${TECHNOLOGY.FILENAME}.yml`), technologyContent);

  info('Initialization done');
};
