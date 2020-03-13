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
const { CONTEXT, TECHNOLOGY, ERROR_CODE } = require('../constants');

const isRequired = (message) => (input) => (input && input.length !== 0 ? true : (message || 'Please provide a value'));

const isTechnoAlreadyExist = async () => {
  const isTechnoFolder = await isRoot();

  if (isTechnoFolder) {
    output.log(chalk.bold('ℹ️  This folder already contains a technology.yaml file.'));
    output.info('    ↳ Technology creation skipped');
  }

  return isTechnoFolder;
};

const isContextAlreadyExist = async () => {
  // TODO: Check for every context.yaml id instead.
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
      },
    ]);
};

const askShouldCreateContext = async () => true;

const askContextInfo = async () => ({});

const askFolderInfo = async ({ id }) => `./${id}`;

const getTechnoConfigFromAnswers = ({
  id,
  label,
  description,
}) => ({
  version: 'v1',
  id,
  label,
  available: true,
  description,
  type: 'JOB',
  logo: './logo.png',
});

const getContextConfigFromAnswers = async () => ({});

const copyTemplateFolder = async (src, dest, vars) => new Promise((resolve, reject) => {
  const srcPath = path.resolve(__dirname, '../templates', src);
  const destPath = path.resolve(process.cwd(), dest);

  copyTemplateDir(srcPath, destPath, vars, (err, createdFiles) => {
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

const generateTechnoYaml = async (folder, config) => fse.outputFile(path.resolve(process.cwd(), `${folder}/${TECHNOLOGY.FILENAME}.yaml`), yaml.stringify(config));

const installDependencies = async (folder) => {
  execSync('npm install --no-package-lock --no-audit --loglevel=error', {
    cwd: path.resolve(process.cwd(), folder),
    stdio: 'inherit',
  });

  output.success('\nDependencies installed successfully');
};

module.exports = async () => {
  output.log(`\nSaagie 📦 SDK - v${version}`);

  const shouldCreateTechno = !(await isTechnoAlreadyExist());
  const technoAnswers = shouldCreateTechno ? await askTechnoInfo() : {};

  const shoudlCreateContext = await askShouldCreateContext();
  const contextAnswers = shoudlCreateContext ? await askContextInfo() : {};

  const folder = await askFolderInfo({ id: technoAnswers.id });

  if (shouldCreateTechno) {
    await copyTemplateFolder(TECHNOLOGY.ID, folder, { id: technoAnswers.id, version });
    const config = await getTechnoConfigFromAnswers(technoAnswers);
    await generateTechnoYaml(folder, config);
  }

  if (shoudlCreateContext) {
    await copyTemplateFolder(CONTEXT.ID, folder, { id: technoAnswers.id });
    // generateContext
  }

  if (shouldCreateTechno) {
    await installDependencies(folder);
  }

  output.success('\nInitialization done');
};
