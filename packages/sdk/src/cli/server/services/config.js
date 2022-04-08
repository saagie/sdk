const getCurrentDir = require('../../utils/getCurrentDir');

const yaml = require('../../utils/yaml');
const { CONTEXT, TECHNOLOGY, CONNECTION_TYPE } = require('../../constants');

module.exports = async (req, res) => {
  const currentDir = getCurrentDir();

  const technologiesData = await yaml.parseFilesToJSON({
    folder: currentDir,
    filename: TECHNOLOGY.FILENAME,
  });
  const technology = (technologiesData || [])[0];

  const contextsData = await yaml.parseFilesToJSON({
    folder: currentDir,
    filename: CONTEXT.FILENAME,
  });

  const labelSortedContextData = contextsData.sort(
    (a, b) => a && a.label && a.label.toString().localeCompare(b && b.label),
  );

  const connectionTypeData = await yaml.parseFilesToJSON({
    folder: `${currentDir}/../../connectiontype`,
    filename: CONNECTION_TYPE.FILENAME,
  });

  const labelSortedConnectionTypeData = connectionTypeData.sort(
    (a, b) => a && a.label && a.label.toString().localeCompare(b && b.label),
  );

  res.send({
    technology,
    contexts: labelSortedContextData,
    connectionTypes: labelSortedConnectionTypeData,
  });
};
