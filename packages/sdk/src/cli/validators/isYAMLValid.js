const yaml = require('yaml');

/**
 * @param {string} content The string to lint.
 * @returns {boolean} true if the content is parsable, false instead.
 */
module.exports = (content) => {
  try {
    yaml.parse(content);
    return true;
  } catch (err) {
    return false;
  }
};
