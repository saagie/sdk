const express = require('express');

const STATUS = {
  STOPPED: 'STOPPED',
  IN_PROGRESS: 'IN_PROGRESS',
};

const datasets = [
  {
    id: '1', name: 'First Dataset', status: undefined,
  },
  {
    id: '2', name: 'Second Dataset', status: undefined,
  },
  {
    id: '3', name: 'Third Dataset', status: undefined,
  },
  {
    id: '4', name: 'Fourth Dataset', status: undefined,
  },
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

demoApp.get('/datasets/:id', (req, res) => {
  const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
  res.send(selectedDataset);
});

module.exports = demoApp;
