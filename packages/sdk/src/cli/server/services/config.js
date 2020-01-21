const yaml = require('../../utils/yaml');
const { CONTEXT, TECHNOLOGY } = require('../../constants');

module.exports = async (req, res) => {
  const currentWorkingDirectory = process.cwd();

  const technologiesData = await yaml.parseFilesToJSON({
    folder: currentWorkingDirectory,
    filename: TECHNOLOGY.FILENAME,
  });
  const technology = (technologiesData || [])[0];

  const contextsData = await yaml.parseFilesToJSON({
    folder: currentWorkingDirectory,
    filename: CONTEXT.FILENAME,
  });

  const labelSortedContextData = contextsData.sort(
    (a, b) => a && a.label && a.label.localeCompare(b && b.label),
  );

  res.send({ technology, contexts: labelSortedContextData });
};
