const axios = require('axios');
const axiosHttp = require('axios/lib/adapters/http');
const Stream = require('stream');

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
 * Function to start the external job instance.
 *
 * It will be called first and once.
 *
 * @param {Object} params
 * @param {Object} params.connection - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @return {Object} - the payload to be associated with the instance
 */
exports.start = async ({ connection, parameters }) => {
  console.log('start compute of', parameters.method, 'with', parameters.iterations, 'iterations in region', connection.region);
  const url = `${connection.url}/api/demo/start`;
  const requestData = {
    method: parameters.method,
    n: parameters.iterations,
    region: connection.region,
    logDate: parameters.logDate
  };
  console.log('Requesting POST at', url, requestData);
  let response;
  try {
    response = await client.post(url, requestData);
  } catch (e) {
    console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
    throw e;
  }
  console.log('Response:', response.data);
  console.log('Job #', response.data.id, 'started');

  // You can return any payload you want to get in the stop and getStatus functions.
  return { jobId: response.data.id };
};

/**
 * Function to stop the external job instance.
 *
 * It will be called if the end user is requesting it.
 *
 * @param {Object} params
 * @param {Object} params.connection - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @param {Object} params.payload - Contains the payload returned by the start function.
 */
exports.stop = async ({ connection, parameters, payload }) => {
  console.log('stop job #', payload.jobId);
  const url = `${connection.url}/api/demo/stop`;
  const requestData = { id: payload.jobId };
  console.log('Requesting POST at', url, requestData);
  let response;
  try {
    response = await client.post(url, requestData);
  } catch (e) {
    if (e.response?.status === 420) {
      // the job exists but is already stopped. Handle this case gracefully
      console.log('Job already stopped');
      return {};
    } else {
      console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
      throw e;
    }
  }
  console.log('Response:', response.data);
  return {};
};

/**
 * Function to retrieve the external job instance status.
 *
 * It will be called at regular intervals, after the start.
 *
 * @param {Object} params
 * @param {Object} params.connection - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @param {Object} params.payload - Contains the payload returned by the start function.
 * @return {string} - the status of the instance, one of JobStatus
 */
exports.getStatus = async ({ connection, parameters, payload}) => {
  console.log('getStatus of job #', payload.jobId);
  const url = `${connection.url}/api/demo/state?id=${payload.jobId}`;
  console.log('Requesting GET at', url);
  let response;
  try {
    response = await client.get(url);
  } catch (e) {
    console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
    throw e;
  }
  console.log('Response:', response.data);
  console.log('Status:', response.data.status);

  switch (response.data.status) {
    case 'STARTING':
      return JobStatus.AWAITING;
    case 'IN_PROGRESS':
      return JobStatus.RUNNING;
    case 'KILLING':
      return JobStatus.KILLING;
    case 'KILLED':
      return JobStatus.KILLED;
    case 'FINISHED':
      return JobStatus.SUCCEEDED;
    case 'ERROR':
      return JobStatus.FAILED;
    default:
      return JobStatus.REQUESTED;
  }
};

/**
 * Function to retrieve the external job instance logs.
 *
 * It will be called after the job is terminated, with failure or not.
 *
 * @param {Object} params
 * @param {Object} params.connection - Contains values configuring the associated connection.
 * @param {Object} params.parameters - Contains the parameters of the external job.
 * @param {Object} params.payload - Contains the payload returned by the start function.
 * @return {Stream} - a stream of objects, each object with 'log' field, the string of the line of log, and a 'timestamp' field, the number of millisecond from 1 Jan 1970 to the log event.
 */
exports.getLogs = async ({ connection, parameters, payload}) => {
  console.log('getLogs of job #', payload.jobId);
  const url = `${connection.url}/api/demo/logs?id=${payload.jobId}`;
  console.log('Requesting GET at', url);
  let response;
  try {
    response = await client.get(url, {
      // make the data a stream to avoid buffering in memory
      responseType: 'stream',
    });

    const logBuffer = [];

    const _pushLog = (transform) => {
      const str = logBuffer.join('');
      if (str.length > 0) {
        const [timestamp, log] = str.split(/\s\-\s/);
        transform.push({ timestamp: parseInt(timestamp), log });
      }
      logBuffer.length = 0;
    };

    const logger = new Stream.Transform({
      readableObjectMode: true,
      writableObjectMode: false,
      transform(chunk, encoding, callback) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
        let lines = buffer.toString().split(/\r\n|\n\r|\n|\r/);

        while (lines.length > 1) {
          logBuffer.push(lines.shift());
          _pushLog(this);
        }
        // append last (potentially uncomplete) line sub into buffer without pushing downstream
        logBuffer.push(lines.shift());
        callback();
      },
      flush(callback) {
        // flushing remaining subs
        _pushLog(this);
        callback();
      },
    });

    return response.data.pipe(logger);
  } catch (e) {
    console.log('HTTP error:', e.response?.status, e.response?.statusText, e.response?.data);
    throw e;
  }
};
