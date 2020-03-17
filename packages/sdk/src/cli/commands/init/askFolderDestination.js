const chalk = require('chalk');
const inquirer = require('inquirer');

const output = require('../../utils/output');

module.exports = async (defaultName) => {
  output.log(chalk.bold('\n👇 Output'));

  const answers = await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'useDefaultFolder',
        message: `Generate in ./${defaultName} folder?`,
      },
      {
        type: 'input',
        name: 'folder',
        prefix: '↳',
        message: '📂 Folder',
        default: `./${defaultName}`,
        when: ({ useDefaultFolder }) => !useDefaultFolder,
      },
    ]);

  return answers.useDefaultFolder ? `./${defaultName}` : answers.folder;
};
