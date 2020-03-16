const { execSync } = require('child_process');
const path = require('path');

const output = require('../../utils/output');

module.exports = async (folder) => {
  output.log('\n🚀 Dependencies installation');

  execSync('npm install --no-package-lock --no-audit --loglevel=error', {
    cwd: path.resolve(process.cwd(), folder),
    stdio: 'inherit',
  });

  output.log('Dependencies installed successfully');
};
