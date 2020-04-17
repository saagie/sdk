const inquirer = require('inquirer');
const chalk = require('chalk');
const { recommended } = require('./dependencies.json');
const output = require('../../utils/output');

module.exports = async () => {
  output.log(chalk`\n👇 {bold Recommended dependencies}\n`);

  return inquirer.prompt([
    {
      type: 'checkbox',
      name: 'dependencies',
      message: 'Select the dependencies to add to your technology',
      choices: recommended,
    },
  ]);
};
