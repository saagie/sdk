const Stream = require('./Stream');

/**
 * @param {string} log - The output that will be given to the UI
 * @param {string} [stream=stdout] - The kind of output style to use
 * @param {string|undefined} [time=undefined] - The date and time given as ISO 8601 format.
 *
 * @see {@link Stream}
 */
module.exports = (log, stream = Stream.STDOUT, time = undefined) => ({
  log,
  stream,
  time,
});
