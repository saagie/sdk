const express = require('express');
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const path = require('path');

const { DEFAULT_PORT } = require('../constants');
const action = require('./services/action');
const config = require('./services/config');
const serveFiles = require('./services/static');

const STATUS = {
  STOPPED: 'STOPPED',
  IN_PROGRESS: 'IN_PROGRESS',
};

const datasets = [
  { id: '1', name: 'First Dataset', status: undefined },
  { id: '2', name: 'Second Dataset', status: undefined },
  { id: '3', name: 'Third Dataset', status: undefined },
  { id: '4', name: 'Fourth Dataset', status: undefined },
];

module.exports = ({ port = DEFAULT_PORT } = {}) => {
  const server = express();

  server.use(bodyParser.json({
    limit: '50mb',
  }));

  if (process.env.SAAGIE_ENV !== 'development') {
    server.use('/', serveStatic(path.resolve(__dirname, '../../../build-webapp')));
  } else {
    server.get('/', (req, res) => res.redirect('http://localhost:3000'));
  }

  server.get('/api/config', config);
  server.post('/api/action', action);
  server.get('/api/static', serveFiles);
  server.get('/api/demo', (req, res) => {
    res.send(datasets);
  });

  server.get('/api/demo/datasets/:id/start', (req, res) => {
    const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
    selectedDataset.status = STATUS.IN_PROGRESS;
    res.send(selectedDataset);
  });

  server.get('/api/demo/datasets/:id/stop', (req, res) => {
    const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
    selectedDataset.status = STATUS.KILLED;
    res.send(selectedDataset);
  });

  server.get('/api/demo/datasets/:id', (req, res) => {
    const selectedDataset = datasets[datasets.findIndex((dataset) => dataset.id === req.params.id)];
    res.send(selectedDataset);
  });

  server.listen(port);

  return { port };
};
