const fs = require('fs');
const globby = require('globby');
const isYAMLValid = require('./isYAMLValid');

module.exports = async (filenameGlob) => {
  const file = (await globby([`./${filenameGlob}`]))[0];
  const content = fs.readFileSync(file, 'utf8');

  return isYAMLValid(content);
};
