const globby = require('globby');
const fs = require('fs');

module.exports = async (filenameGlob) => {
  const file = (await globby([`./${filenameGlob}`]))[0];
  const content = fs.readFileSync(file, 'utf8');

  return content === '';
};
