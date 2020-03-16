const inquirer = require('inquirer');
const yaml = require('yaml');
const fse = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const slugify = require('slugify');
const copyTemplateDir = require('copy-template-dir');
const { version } = require('../../../package.json');

const isRoot = require('../validators/isRoot');
const output = require('../utils/output');
const { CONTEXT, TECHNOLOGY } = require('../constants');

const isRequired = (message) => (input) => (input && input.length !== 0 ? true : (message || 'Please provide a value'));

const isTechnoAlreadyExist = async () => {
  const isTechnoFolder = await isRoot();

  if (isTechnoFolder) {
    output.log(chalk.bold('ℹ️  This folder already contains a technology.yaml file.'));
    output.info('    ↳ Technology creation skipped');
  }

  return isTechnoFolder;
};

const isContextAlreadyExist = async (contextId) => {
  // TODO: Check in every context.yaml id instead.
  if (await fse.pathExists(contextId)) {
    return true;
  }

  return false;
};

const askTechnoInfo = async () => {
  output.log(chalk.bold('\n👇 New technology'));

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'label',
        default: 'My Technology',
        filter: (input) => input.trim(),
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'id',
        message: 'id',
        default: ({ label }) => slugify(label, { lower: true, strict: true }),
        filter: (input) => slugify(input, { lower: true, strict: true }),
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'description',
        message: 'description',
        default: 'no description',
        filter: (input) => (input === 'no description' ? '' : input),
      },
    ]);
};

const askShouldCreateContext = async () => {
  const answers = await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'shouldCreateContext',
        message: 'Create your first context? (recommended)',
      },
    ]);

  return answers.shouldCreateContext;
};

const askContextInfo = async () => {
  output.log(chalk.bold('\n👇 New context'));

  return inquirer
    .prompt([
      {
        type: 'input',
        name: 'label',
        message: 'label',
        default: 'My Context',
        filter: (input) => input.trim(),
        validate: isRequired(),
      },
      {
        type: 'input',
        name: 'id',
        message: 'id',
        default: ({ label }) => slugify(label, { lower: true, strict: true }),
        filter: (input) => slugify(input, { lower: true, strict: true }),
        validate: async (input) => {
          if (await isContextAlreadyExist(input)) {
            return `Context ${input} already exists`;
          }

          return isRequired()(input);
        },
      },
      {
        type: 'input',
        name: 'description',
        message: 'description',
        default: 'no description',
        filter: (input) => (input === 'no description' ? '' : input),
      },
    ]);
};

const askFolderDestination = async (defaultName) => {
  output.log(chalk.bold('\n👇 Output'));

  const answers = await inquirer
    .prompt([
      {
        type: 'confirm',
        name: 'useDefaultFolder',
        message: `Generate in ./${defaultName}`,
      },
      {
        type: 'input',
        name: 'folder',
        prefix: '↳',
        message: '📂 Folder',
        default: `./${defaultName}`,
        when: ({ useDefaultFolder }) => !useDefaultFolder,
      },
    ]);

  return answers.useDefaultFolder ? `./${defaultName}` : answers.folder;
};

const getTechnoConfigFromAnswers = ({
  id,
  label,
  description,
}) => ({
  version: 'v1',
  id,
  label,
  description,
  available: true,
  type: 'JOB',
  logo: './logo.png',
});

const getContextConfigFromAnswers = async ({
  id,
  label,
  description,
  recommended,
}) => ({
  id,
  label,
  description,
  available: true,
  recommended,
  trustLevel: 'stable',
  endpoint: {
    features: [
      {
        type: 'URL',
        name: 'url',
        label: 'Endpoint URL',
        required: true,
        helper: 'e.g. use http://localhost:4000',
      },
    ],
  },
  job: {
    features: [
      {
        type: 'ENDPOINT',
        name: 'endpoint',
        label: 'Endpoint',
        required: true,
      },
      {
        type: 'SELECT',
        name: 'dataset',
        label: 'Dataset',
        required: true,
        options: {
          script: './jobForm.js',
          function: 'getDatasets',
        },
        dependsOn: [
          'endpoint',
        ],
      },
    ],
  },
});

const copyTemplateFolder = async ({ src, dest, variables }) => new Promise((resolve, reject) => {
  const srcPath = path.resolve(__dirname, '../templates', src);
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

const generateYaml = async ({
  filename,
  folder,
  config,
}) => fse.outputFile(path.resolve(process.cwd(), `${folder}/${filename}.yaml`), yaml.stringify(config));

const installDependencies = async (folder) => {
  output.log('\n🚀 Dependencies installation');

  execSync('npm install --no-package-lock --no-audit --loglevel=error', {
    cwd: path.resolve(process.cwd(), folder),
    stdio: 'inherit',
  });

  output.log('Dependencies installed successfully');
};

module.exports = async () => {
  output.log(`\nSaagie 📦 SDK - v${version}`);

  // 1. Ask user

  const shouldCreateTechno = !(await isTechnoAlreadyExist());
  const technoAnswers = shouldCreateTechno ? await askTechnoInfo() : {};

  const shoudlCreateContext = await askShouldCreateContext();
  const contextAnswers = shoudlCreateContext ? await askContextInfo() : {};

  const folder = await askFolderDestination(technoAnswers.id);

  // 2. Generate files

  if (shouldCreateTechno) {
    await copyTemplateFolder({
      src: TECHNOLOGY.ID,
      dest: folder,
      variables: { id: technoAnswers.id, version },
    });
    const config = await getTechnoConfigFromAnswers(technoAnswers);
    await generateYaml({
      filename: TECHNOLOGY.ID,
      folder,
      config,
    });
  }

  if (shoudlCreateContext) {
    const contextFolder = path.resolve(folder, contextAnswers.id);
    await copyTemplateFolder({
      src: CONTEXT.ID,
      dest: contextFolder,
      variables: {},
    });
    const config = await getContextConfigFromAnswers(contextAnswers);
    await generateYaml({
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
