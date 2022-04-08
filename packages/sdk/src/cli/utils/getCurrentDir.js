const { isWindows } = require('./isWindows');

module.exports = () => {
  // globby do not work when it sees \\ (backslashes) so we replace all occurences
  // of them with a simple / (slash). We do not want to replace \\ (backslashes)
  // in Unix environment as it is a valid path.
  let normalizedCurrentWorkingDirectory = process.cwd();
  if (isWindows()) {
    normalizedCurrentWorkingDirectory = normalizedCurrentWorkingDirectory.replace(/\\/g, '/');
  }
  return normalizedCurrentWorkingDirectory;
};
