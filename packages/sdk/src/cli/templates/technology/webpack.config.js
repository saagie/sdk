const path = require('path');

module.exports = {
  target: 'node16',
  mode: 'production',
  entry: './default/module.js',
  output: {
    library: {
      type: 'commonjs',
    },
    path: path.resolve(__dirname, 'default'),
    filename: 'bundle.js',
  },
};
