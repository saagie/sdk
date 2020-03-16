const axios = require('axios');
const { Response } = require('@saagie/sdk');

exports.start = async ({ name, formParams }) => {
  try {
    await axios.get(
      `${formParams.endpoint.url}/api/demo/datasets/${formParams.dataset.id}/start`,
    );

    return Response.success();
  } catch (error) {
    return Response.error(`Fail to job "${name}"`, { error, url: `${formParams.endpoint.url}/api/demo/datasets/${formParams.dataset.id}/start` });
  }
};

exports.stop = async ({ name, formParams }) => {
  try {
    await axios.get(
      `${formParams.endpoint.url}/api/demo/datasets/${formParams.dataset.id}/stop`,
    );

    return Response.success();
  } catch (error) {
    return Response.error(`Fail to stop job "${name}"`, { error });
  }
};

exports.getStatus = async ({ formParams }) => {
  try {
    const { data } = await axios.get(
      `${formParams.endpoint.url}/api/demo/datasets/${formParams.dataset.id}`,
    );

    return Response.success(data.status);
  } catch (error) {
    return Response.error(`Failed to get status for dataset ${formParams.dataset.id}`, { error });
  }
};
