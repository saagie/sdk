module.exports = async ({
  id,
  label,
  description,
}) => ({
  version: 'v1',
  id,
  label,
  description,
  available: true,
  type: 'JOB',
  logo: './logo.png',
});
