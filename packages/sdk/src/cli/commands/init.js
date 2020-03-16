const path = require('path');
const chalk = require('chalk');
const { version } = require('../../../package.json');

const isRoot = require('../validators/isRoot');
const output = require('../utils/output');
const { generateYamlFile } = require('../utils/yaml');
const copyTemplateFolder = require('../utils/copyTemplateFolder');
const { CONTEXT, TECHNOLOGY } = require('../constants');

const askTechnologyInfo = require('./init/askTechnologyInfo');
const askContextInfo = require('./init/askContextInfo');
const askShouldCreateContext = require('./init/askShouldCreateContext');
const askFolderDestination = require('./init/askFolderDestination');
const getContextConfigFromAnswers = require('./init/getContextConfigFromAnswers');
const getTechnologyConfigFromAnswers = require('./init/getTechnologyConfigFromAnswers');
const installDependencies = require('./init/installDependencies');

const TEMPLATE_FOLDER = '../templates';

const isTechnoAlreadyExist = async () => {
  const isTechnoFolder = await isRoot();

  if (isTechnoFolder) {
    output.log(chalk.bold('ℹ️  This folder already contains a technology.yaml file.'));
    output.info('    ↳ Technology creation skipped');
  }

  return isTechnoFolder;
};

module.exports = async () => {
  output.log(`\nSaagie 📦 SDK - v${version}`);

  // 1. Ask user

  const shouldCreateTechno = !(await isTechnoAlreadyExist());
  const technoAnswers = shouldCreateTechno ? await askTechnologyInfo() : {};

  const shoudlCreateContext = await askShouldCreateContext();
  const contextAnswers = shoudlCreateContext ? await askContextInfo() : {};

  const folder = await askFolderDestination(technoAnswers.id);

  // 2. Generate files

  if (shouldCreateTechno) {
    await copyTemplateFolder({
      src: path.resolve(__dirname, TEMPLATE_FOLDER, TECHNOLOGY.ID),
      dest: folder,
      variables: { id: technoAnswers.id, version },
    });
    const config = await getTechnologyConfigFromAnswers(technoAnswers);
    await generateYamlFile({
      filename: TECHNOLOGY.ID,
      folder,
      config,
    });
  }

  if (shoudlCreateContext) {
    const contextFolder = path.resolve(folder, contextAnswers.id);
    await copyTemplateFolder({
      src: path.resolve(__dirname, TEMPLATE_FOLDER, CONTEXT.ID),
      dest: contextFolder,
      variables: {},
    });
    const config = await getContextConfigFromAnswers(contextAnswers);
    await generateYamlFile({
      filename: CONTEXT.ID,
      folder: contextFolder,
      config,
    });
  }

  // 3. Install

  if (shouldCreateTechno) {
    await installDependencies(folder);
  }

  output.log(chalk`

{bold {green 🎉 ${technoAnswers.label} generated with success 🎉}}

New technology available in {italic ${folder}}
Inside that directory, you can run several commands:

  {cyan npm start}
    Start the development server.

  {cyan npm run build}
    Bundle the technology for the Saagie platform.

We suggest that you begin by typing:

  {cyan cd} {italic ${folder}}
  {cyan npm start}

  `);
};
