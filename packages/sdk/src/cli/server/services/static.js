const path = require('path');

module.exports = async (req, res) => {
  res.sendFile(path.resolve(process.cwd(), req.query.path));
};
