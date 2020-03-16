const globby = require('globby');
const fse = require('fs-extra');
const yaml = require('yaml');
const path = require('path');
const {
  CONTEXT, TECHNOLOGY, BUILD_FOLDER, METADATA,
} = require('../constants');

const { error } = require('./output');

const generateYamlFile = async ({
  filename,
  folder,
  config,
}) => fse.outputFile(path.resolve(process.cwd(), `${folder}/${filename}.yaml`), yaml.stringify(config));

exports.generateYamlFile = generateYamlFile;

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

exports.generateMetadataFile = async () => {
  const technologiesPaths = await globby([`./${TECHNOLOGY.FILENAME_GLOB}`]) || [];
  const technologyPath = technologiesPaths[0];

  const contextsPaths = await globby([`./**/${CONTEXT.FILENAME_GLOB}`]) || [];

  const technologyContent = fse.readFileSync(technologyPath, 'utf8');

  const contextsContent = await Promise.all(
    contextsPaths.map(
      (contextPath) => new Promise((resolve, reject) => {
        fse.readFile(contextPath, 'utf8', (err, data) => {
          if (err) {
            reject(err);
          }

          resolve(data);
        });
      }),
    ),
  );

  const metadataContent = yaml.parseDocument(technologyContent);

  const contextsNode = contextsContent.map((x) => yaml.parseDocument(x));
  metadataContent.set('contexts', contextsNode);

  generateYamlFile(BUILD_FOLDER, METADATA.FILENAME, metadataContent.toString());
};
