const slugify = require('slugify');
const chalk = require('chalk');
const inquirer = require('inquirer');
const figures = require('figures');

const output = require('../../utils/output');
const { isRequired } = require('../../validators/inquirer');

module.exports = async () => {
  output.log('');

  output.log(chalk`
👇 {bold New connection type}
${figures.pointerSmall} {bold label} {gray will be diplayed in the User Interface}
${figures.pointerSmall} {bold id} {gray must be {bold unique} in your repository}
${figures.pointerSmall} {bold description} {gray will be diplayed in the User Interface}
`);

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'label',
        default: 'My Connection Type',
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
        transformer: (input) => (!input ? chalk`{gray (no description)}` : input),
      },
    ]);
};
