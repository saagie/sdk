const slugify = require('slugify');
const chalk = require('chalk');
const inquirer = require('inquirer');

const output = require('../../utils/output');
const { isRequired } = require('../../validators/inquirer');

module.exports = async () => {
  output.log(chalk`\n👇 {bold New technology}`);

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'label',
        default: 'My Technology',
        filter: (input) => input.trim(),
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'id',
        message: 'id',
        default: ({ label }) => slugify(label, { lower: true }),
        filter: (input) => slugify(input, { lower: true }),
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'description',
        message: 'description',
        default: 'no description',
        filter: (input) => (input === 'no description' ? '' : input),
      },
    ]);
};
