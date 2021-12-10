const path = require('path');
const chalk = require('chalk');
const slugify = require('slugify');

const { version } = require('../../../package.json');
const isRoot = require('../validators/isRoot');
const output = require('../utils/output');
const copyTemplateFolder = require('../utils/copyTemplateFolder');
const { CONTEXT, TECHNOLOGY } = require('../constants');

const askTechnologyInfo = require('./init/askTechnologyInfo');
const askContextInfo = require('./init/askContextInfo');
const askShouldCreateContext = require('./init/askShouldCreateContext');
const askFolderDestination = require('./init/askFolderDestination');

const TEMPLATE_FOLDER = '../templates';

const createTechnology = async () => {
  // 1. Ask user

  const technoAnswers = await askTechnologyInfo();
  const shoudlCreateContext = await askShouldCreateContext();
  const contextAnswers = shoudlCreateContext ? await askContextInfo() : {};
  const folder = await askFolderDestination(technoAnswers.id);

  // 2. Generate files

  await copyTemplateFolder({
    src: path.resolve(__dirname, TEMPLATE_FOLDER, TECHNOLOGY.ID),
    dest: folder,
    variables: {
      ...technoAnswers,
      npmVersion: version,
      npmName: slugify(technoAnswers.id, { strict: true }),
    },
  });

  if (shoudlCreateContext) {
    const contextFolder = path.resolve(folder, contextAnswers.id);
    await copyTemplateFolder({
      src: path.resolve(__dirname, TEMPLATE_FOLDER, CONTEXT.ID),
      dest: contextFolder,
      variables: { ...contextAnswers },
    });
  }

  // 3. Output

  output.log(chalk`

{bold {green 🎉 ${technoAnswers.label} technology generated with success 🎉}}

New technology available in {italic ${folder}}
Inside that directory, you can run several commands:

  {cyan npm start}
    Start the development server.

  {cyan npm run build}
    Bundle the technology for the Saagie platform.

  {cyan npm run new:context}
    Generate a new context.

We suggest that you begin by typing:

  {cyan cd} {italic ${folder}}
  {cyan npm start}

  `);
};

const createContext = async () => {
  // 1. Ask user

  const contextAnswers = await askContextInfo();
  const folder = await askFolderDestination(contextAnswers.id);

  // 2. Generate files

  await copyTemplateFolder({
    src: path.resolve(__dirname, TEMPLATE_FOLDER, CONTEXT.ID),
    dest: folder,
    variables: { ...contextAnswers },
  });

  // 3. Output

  output.log(chalk`

{bold {green Context '${contextAnswers.label}' generated with success}}

New context available in {italic ${folder}}
  `);
};

module.exports = async () => {
  output.log(chalk`
{bold Saagie 📦 SDK - v${version}}
📚 {italic Full documentation:} {cyan http://go.saagie.com/sdk-docs}`);

  const isTechnoAlreadyExist = await isRoot();

  if (!isTechnoAlreadyExist) {
    await createTechnology();
  } else {
    output.log(chalk`
ℹ️  {bold This folder already contains a technology.yaml file.}
    {cyan ↳ Technology creation skipped}`);
    await createContext();
  }
};
