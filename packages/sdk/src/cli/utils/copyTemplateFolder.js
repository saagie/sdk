const path = require('path');
const copyTemplateDir = require('copy-template-dir');
const output = require('./output');

module.exports = async ({ src, dest, variables }) => new Promise((resolve, reject) => {
  const srcPath = path.resolve(src);
  const destPath = path.resolve(process.cwd(), dest);

  copyTemplateDir(srcPath, destPath, variables, (err, createdFiles) => {
    if (err) {
      reject(err);
      return;
    }
    if (process.env.SAAGIE_ENV === 'development') {
      createdFiles.forEach((filePath) => output.log(`Created ${filePath}`));
    }
    resolve();
  });
});
