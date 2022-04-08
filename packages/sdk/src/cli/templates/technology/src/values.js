const axios = require('axios');
const axiosHttp = require('axios/lib/adapters/http');

const client = axios.create({
  adapter: axiosHttp,
});

/**
 * Example of function to retrieve select options.
 * @param {Object} params - Contains entity data including featuresValues.
 * @param {Object} params.connection - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job that has already been filled
 * @return {Array<{id, label}>} - the array of id and label of the values
 */
exports.getMethods = async ({ connection, parameters }) => {
  const url = `${connection.url}/api/demo/methods`
  console.log('Requesting GET at', url);
  let response;
  try {
    response = await client.get(url);
  } catch (e) {
    console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
    throw e;
  }
  console.log('Response:', response.data);

  const methods = response.data;
  if (!methods || !methods.length) {
    return [];
  }

  return methods.map(({ name, id }) => ({ id, label: name }));
};
