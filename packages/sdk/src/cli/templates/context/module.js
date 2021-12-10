const axios = require('axios');
const axiosHttp = require('axios/lib/adapters/http');

const client = axios.create({
  adapter: axiosHttp,
});

const JobStatus = {
  AWAITING: 'AWAITING',
  REQUESTED: 'REQUESTED',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  SUCCEEDED: 'SUCCEEDED',
  KILLING: 'KILLING',
  KILLED: 'KILLED',
  FAILED: 'FAILED',
};

/**
 * Logic to start the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data.
 * @return {Object} - the payload to be associated with the instance
 */
exports.start = async ({ job, instance }) => {
  console.log('START INSTANCE:', instance);
  const { data } = await client.post(`${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/start`);

  // You can return any payload you want to get in the stop and getStatus functions.
  return { customId: data.id };
};

/**
 * Logic to stop the external job instance.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 */
exports.stop = async ({ job, instance }) => {
  console.log('STOP INSTANCE:', instance);
  await client.post(`${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/stop`);
};

/**
 * Logic to retrieve the external job instance status.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 * @return {string} - the status of the instance, one of JobStatus
 */
exports.getStatus = async ({ job, instance }) => {
  console.log('GET STATUS INSTANCE:', instance);
  const { data } = await client.get(`${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}`);

  switch (data.status) {
    case 'IN_PROGRESS':
      return JobStatus.RUNNING;
    case 'STOPPED':
      return JobStatus.KILLED;
    default:
      return JobStatus.AWAITING;
  }
};

/**
 * Logic to retrieve the external job instance logs.
 * @param {Object} params
 * @param {Object} params.job - Contains job data including featuresValues.
 * @param {Object} params.instance - Contains instance data including the payload returned in the start function.
 * @return {Stream} - a stream of data for the logs
 */
exports.getLogs = async ({ job, instance }) => {
  console.log('GET LOG INSTANCE:', instance);
  const { data } = await client.get(
    `${job.featuresValues.endpoint.url}/api/demo/datasets/${job.featuresValues.dataset.id}/logs`,
    {
      responseType: 'stream',
    }
  );

  return data;
};

/**
 * Example of function to retrieve select options from an external endpoint.
 * @param {Object} entity - Contains entity data including featuresValues.
 * @param {Object} entity.featuresValues - Contains all the values from the entity features declared in the context.yaml
 * @return {Array<{id, label}>} - the array of id and label of the values
 */
exports.getDatasets = async ({ featuresValues }) => {
  const { data: datasets } = await client.get(`${featuresValues.endpoint.url}/api/demo/datasets`);

  if (!datasets || !datasets.length) {
    return [];
  }

  return datasets.map(({ name, id }) => ({ id, label: name }));
};
