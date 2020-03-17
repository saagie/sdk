const slugify = require('slugify');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fse = require('fs-extra');

const output = require('../../utils/output');
const { isRequired } = require('../../validators/inquirer');

const isContextAlreadyExist = async (contextId) => {
  // TODO: Check in every context.yaml id instead.
  if (await fse.pathExists(contextId)) {
    return true;
  }

  return false;
};


module.exports = async () => {
  output.log(chalk.bold('\n👇 New context'));

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'label',
        default: 'My Context',
        filter: (input) => input.trim(),
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'id',
        message: 'id',
        default: ({ label }) => slugify(label, { lower: true }),
        filter: (input) => slugify(input, { lower: true }),
        validate: async (input) => {
          if (await isContextAlreadyExist(input)) {
            return `Context ${input} already exists`;
          }

          return isRequired()(input);
        },
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
