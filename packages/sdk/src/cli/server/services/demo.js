const express = require('express');

const STATUS = {
  STOPPED: 'STOPPED',
  IN_PROGRESS: 'IN_PROGRESS',
};

const datasets = [
  {
    id: '1', name: 'First Dataset', status: undefined, logs: [],
  },
  {
    id: '2', name: 'Second Dataset', status: undefined, logs: [],
  },
  {
    id: '3', name: 'Third Dataset', status: undefined, logs: [],
  },
  {
    id: '4', name: 'Fourth Dataset', status: undefined, logs: [],
  },
  {
    id: '5', name: 'Fifth Dataset with a very long name containing spaces. Helpful to check the behavior of the Select Box input type.', status: undefined, logs: [],
  },
];

const logs = [
  'Cleaning workspace',
  'Installing dependencies',
  'Fetching data',
  'Working good',
  'Hello World',
];

const demoApp = express();

demoApp.get('/datasets', (req, res) => {
  res.send(datasets);
});

demoApp.post('/datasets/:id/start', (req, res) => {
  const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
  selectedDataset.status = STATUS.IN_PROGRESS;
  res.send(selectedDataset);
});

demoApp.post('/datasets/:id/stop', (req, res) => {
  const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
  selectedDataset.status = STATUS.STOPPED;
  res.send(selectedDataset);
});

demoApp.get('/datasets/:id/logs', (req, res) => {
  const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
  const randomLogsIndex = Math.floor(Math.random() * logs.length);

  // Push a new log in the logs array for the example. Each request will create
  // a new object.
  selectedDataset.logs.push({
    // eslint-disable-next-line security/detect-object-injection
    log: `[LOGS] Log for the dataset ${selectedDataset.id}: ${logs[randomLogsIndex]}`,
    output: randomLogsIndex % 2 === 0 ? 'stdout' : 'stderr',
    time: (new Date()).toISOString(),
  });

  res.send({
    logs: selectedDataset.logs,
  });
});

demoApp.get('/datasets/:id', (req, res) => {
  const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
  res.send(selectedDataset);
});

module.exports = demoApp;
