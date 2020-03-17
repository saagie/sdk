const axios = require('axios');
const { Response, JobStatus } = require('@saagie/sdk');

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

    switch (data.status) {
      case 'IN_PROGRESS':
        return Response.success(JobStatus.RUNNING);
      case 'STOPPED':
        return Response.success(JobStatus.KILLED);
      default:
        return Response.success(JobStatus.AWAITING);
    }
  } catch (error) {
    return Response.error(`Failed to get status for dataset ${formParams.dataset.id}`, { error });
  }
};
