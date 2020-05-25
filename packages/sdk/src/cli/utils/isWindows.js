const os = require('os');

const isWindows = () => os.platform() === 'win32';

exports.isWindows = isWindows;
