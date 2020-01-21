const globby = require('globby');
const fs = require('fs-extra');
const yaml = require('yaml');
const path = require('path');
const {
  CONTEXT, TECHNOLOGY, BUILD_FOLDER, METADATA,
} = require('../constants');

const { error } = require('./output');

exports.parseFilesToJSON = async ({
  folder = '.',
  filename = '*',
  ignore = 'node_modules',
} = {}) => {
  try {
    const paths = await globby(
      [`${folder}/**/${filename}.{yml,yaml}`]
        .concat(ignore ? [`!${ignore}`] : []),
    );

    return paths.map((filePath) => {
      const content = fs.readFileSync(filePath, 'utf8');
      const jsonContent = yaml.parse(content);
      jsonContent.__folderPath = filePath.split('/').slice(0, -1).join('/');
      return jsonContent;
    });
  } catch (err) {
    error(err);
    return [];
  }
};

exports.generateMetadataFile = async () => {
  const technologiesPaths = await globby([`./${TECHNOLOGY.FILENAME_GLOB}`]) || [];
  const technologyPath = technologiesPaths[0];

  const contextsPaths = await globby([`./**/${CONTEXT.FILENAME_GLOB}`]) || [];

  const technologyContent = fs.readFileSync(technologyPath, 'utf8');

  // TODO: Read file async using Promise.all([]) ???
  const contextsContent = contextsPaths.map((contextPath) => fs.readFileSync(contextPath, 'utf8'));

  const metadataContent = yaml.parseDocument(technologyContent);

  const contextsNode = contextsContent.map((x) => yaml.parseDocument(x));
  metadataContent.set('contexts', contextsNode);

  fs.outputFileSync(path.resolve(BUILD_FOLDER, `${METADATA.FILENAME}.yml`), metadataContent.toString());
};
