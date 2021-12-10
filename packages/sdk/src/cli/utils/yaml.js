const globby = require('globby');
const fse = require('fs-extra');
const yaml = require('yaml');

const { error } = require('./output');

exports.parseFilesToJSON = async ({
  folder = '.',
  filename = '*',
  ignore = '**/node_modules',
} = {}) => {
  try {
    const paths = await globby(
      [`${folder}/**/${filename}.{yml,yaml}`]
        .concat(ignore ? [`!${ignore}`] : []),
    );

    return paths.map((filePath) => {
      const content = fse.readFileSync(filePath, 'utf8');
      const jsonContent = yaml.parse(content);
      jsonContent.__folderPath = filePath.split('/').slice(0, -1).join('/');
      return jsonContent;
    });
  } catch (err) {
    error(err);
    return [];
  }
};
