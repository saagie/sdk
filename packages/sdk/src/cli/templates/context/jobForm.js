const axios = require('axios');
const { Response } = require('@saagie/sdk');

exports.getDatasets = async ({ formParams }) => {
  try {
    const { data: datasets } = await axios.get(
      `${formParams.endpoint.url}/api/demo/datasets`,
    );

    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables');
    }

    return Response.success(
      datasets.map(({ name, id }) => ({
        id,
        label: name,
      })),
    );
  } catch (error) {
    return Response.error("Can't retrieve datasets", { error });
  }
};
