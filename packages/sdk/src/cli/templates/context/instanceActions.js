const axios = require('axios');
const { Response, JobStatus } = require('@saagie/sdk');

exports.start = async ({ formParams, instance }) => {
  try {
    console.log('START INSTANCE:', instance);
    const { data } = await axios.get(
      `${formParams.endpoint.url}/api/demo/datasets/${formParams.dataset.id}/start`,
    );

    // You can return any payload you want to get in the stop and getStatus functions.
    return Response.success({ customId: data.id });
  } catch (error) {
    return Response.error('Fail to start job', { error, url: `${formParams.endpoint.url}/api/demo/datasets/${formParams.dataset.id}/start` });
  }
};

exports.stop = async ({ formParams, instance }) => {
  try {
    console.log('STOP INSTANCE:', instance);
    await axios.get(
      `${formParams.endpoint.url}/api/demo/datasets/${formParams.dataset.id}/stop`,
    );

    return Response.success();
  } catch (error) {
    return Response.error('Fail to stop job', { error });
  }
};

exports.getStatus = async ({ formParams, instance }) => {
  try {
    console.log('GET STATUS INSTANCE:', instance);
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
