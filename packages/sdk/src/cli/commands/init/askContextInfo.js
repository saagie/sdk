const slugify = require('slugify');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fse = require('fs-extra');
const figures = require('figures');

const output = require('../../utils/output');
const { isRequired } = require('../../validators/inquirer');

const doesContextAlreadyExist = async (contextId) => {
  // TODO: Check in every context.yaml id instead.
  if (await fse.pathExists(contextId)) {
    return true;
  }

  return false;
};

module.exports = async (connectionTypes) => {
  output.log(chalk`
👇 {bold New context}
${figures.pointerSmall} {bold label} {gray will be displayed in the User Interface}
${figures.pointerSmall} {bold id} {gray must be {bold unique} in your technology}
${figures.pointerSmall} {bold description} {gray will be displayed in the User Interface}
${figures.pointerSmall} {bold recommended} {gray will recommend this context to users}
${figures.pointerSmall} {bold connection type id} {gray the id of the connection type to associate with}
`);

  const connectionTypeChoices = connectionTypes
    .map((connectionType) => `${connectionType.id}: ${connectionType.label}`)
    .sort((a, b) => a.localeCompare(b))
    .concat('create a new one');

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'label',
        default: 'Default',
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
          if (await doesContextAlreadyExist(input)) {
            return `Context ${input} already exists`;
          }

          return isRequired()(input);
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'description',
        transformer: (input) => (!input ? chalk`{gray (no description)}` : input),
      },
      {
        type: 'list',
        name: 'recommended',
        message: 'recommended',
        choices: ['true', 'false'],
        filter: (input) => input === 'true',
      },
      {
        type: 'list',
        name: 'connectionTypeId',
        message: 'Choose the connection type to associate with',
        choices: connectionTypeChoices,
      },
    ]);
};
