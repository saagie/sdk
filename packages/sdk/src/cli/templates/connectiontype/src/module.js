const axios = require('axios');
const axiosHttp = require('axios/lib/adapters/http');

const client = axios.create({
  adapter: axiosHttp,
});

/**
 * Example of function to check the connection data.
 * @param {Object} params - Contains entity data including featuresValues.
 * @param {Object} params.connection - Contains values configuring the associated connection.
 * @return {{ok, message}} - an object with a boolean field 'ok' indicating the connection status, and a string field 'message' describing the issue if the connection is not ok.
 */
exports.checkConnection = async ({ connection}) => {
  const url = `${connection.url}`
  console.log('Requesting GET at', url);
  let response;
  try {
    response = await client.get(url);
  } catch (e) {
    console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
    if (e.response?.status === 401) {
      return {
        ok: false,
        message: 'Bad credentials',
      };
    }
    return {
      ok: false,
      message: `Unexpected HTTP error with status ${e.response?.status}`,
    };
  }
  console.log('Response:', response.data);

  return {
    ok: true,
  };
};
