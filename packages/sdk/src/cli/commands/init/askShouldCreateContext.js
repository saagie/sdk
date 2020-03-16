const inquirer = require('inquirer');

module.exports = async () => {
  const answers = await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'shouldCreateContext',
        message: 'Create your first context? (recommended)',
      },
    ]);

  return answers.shouldCreateContext;
};
