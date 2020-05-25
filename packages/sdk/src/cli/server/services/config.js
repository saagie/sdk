const { isWindows } = require('../../utils/isWindows');

const yaml = require('../../utils/yaml');
const { CONTEXT, TECHNOLOGY } = require('../../constants');

module.exports = async (req, res) => {
  // globby do not work when it sees \\ (backslashes) so we replace all occurences
  // of them with a simple / (slash). We do not want to replace \\ (backslashes)
  // in Unix environment as it is a valid path.
  let normalizedCurrentWorkingDirectory = process.cwd();
  if (isWindows()) {
    normalizedCurrentWorkingDirectory = normalizedCurrentWorkingDirectory.replace(/\\/g, '/');
  }

  const technologiesData = await yaml.parseFilesToJSON({
    folder: normalizedCurrentWorkingDirectory,
    filename: TECHNOLOGY.FILENAME,
  });
  const technology = (technologiesData || [])[0];

  const contextsData = await yaml.parseFilesToJSON({
    folder: normalizedCurrentWorkingDirectory,
    filename: CONTEXT.FILENAME,
  });

  const labelSortedContextData = contextsData.sort(
    (a, b) => a && a.label && a.label.localeCompare(b && b.label),
  );

  res.send({ technology, contexts: labelSortedContextData });
};
