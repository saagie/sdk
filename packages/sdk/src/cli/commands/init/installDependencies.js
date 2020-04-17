const { execSync } = require('child_process');
const path = require('path');

const output = require('../../utils/output');

/**
 * @param {string} folder The folder where npm install should be run.
 * @param {Array<string>} dependencies The dependencies to install.
 */
module.exports = async (folder, dependencies = []) => {
  output.log('\n🚀 Dependencies installation');

  execSync(`npm install ${dependencies.join(' ')} --no-package-lock --no-audit --loglevel=error --save-exact`, {
    cwd: path.resolve(process.cwd(), folder),
    stdio: 'inherit',
  });


  output.log('Dependencies installed successfully');
};
