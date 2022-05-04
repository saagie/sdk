const express = require('express');

const STATUS = {
  STARTING: 'STARTING',
  IN_PROGRESS: 'IN_PROGRESS',
  KILLING: 'KILLING',
  KILLED: 'KILLED',
  FINISHED: 'FINISHED',
  ERROR: 'ERROR',
};

const DELAY_RUN = 3000;
const DELAY_STEP = 500;
const DELAY_KILL = 3000;
const DELAY_LOG = 200;
const DELAY_ERROR = 1000;

const factorials = [1];
const factorial = (x) => {
  // eslint-disable-next-line security/detect-object-injection
  let f = factorials[x];
  if (f) {
    return f;
  }
  f = x * factorial(x - 1);
  // eslint-disable-next-line security/detect-object-injection
  factorials[x] = f;
  return f;
};

const ramanujanConstant = (2.0 * Math.sqrt(2.0)) / 9801.0;

const methods = [
  {
    id: 'monte-carlo',
    name: 'Monte Carlo',
    init: () => ({ sum: 0.0, n: 0 }),
    calc: (acc) => {
      const x = Math.random() * 2.0 - 1.0;
      const y = Math.random() * 2.0 - 1.0;
      if (Math.sqrt(x * x + y * y) <= 1.0) {
        acc.sum += 4.0;
      }
      acc.n += 1;
      return acc.sum / acc.n;
    },
  },
  {
    id: 'leibniz',
    name: 'Leibniz series',
    init: () => ({ sum: 0.0, n: 0, sign: 1.0 }),
    calc: (acc) => {
      acc.sum += acc.sign / (2.0 * acc.n + 1.0);
      acc.sign = -acc.sign;
      acc.n += 1;
      return 4 * acc.sum;
    },
  },
  {
    id: 'nilakantha',
    name: 'Nilakantha series',
    init: () => ({ sum: 3.0, n: 2, sign: 1.0 }),
    calc: (acc) => {
      acc.sum += acc.sign * (4.0 / (acc.n * (acc.n + 1.0) * (acc.n + 2.0)));
      acc.sign = -acc.sign;
      acc.n += 2;
      return acc.sum;
    },
  },
  {
    id: 'ramanujan',
    name: 'Ramanujan series',
    init: () => ({ sum: 0.0, n: 0 }),
    calc: (acc) => {
      acc.sum += ramanujanConstant * (factorial(4 * acc.n) / (factorial(acc.n) ** 4))
        * ((26390.0 * acc.n + 1103.0) / (396 ** (4 * acc.n)));
      acc.n += 1;
      return 1.0 / acc.sum;
    },
  },
  {
    id: 'random-error',
    name: 'Random error',
    init: () => ({}),
    calc: () => {
      const x = Math.random() * 6;
      if (Math.abs(x - 3.1) < 0.5) {
        throw new Error(`Too much luck, ${x} too close to Pi !`);
      }
      return x;
    },
  },
];

let jobId = 0;
const jobStates = [];

const log = (state, message) => {
  let msg = message;
  const now = new Date();
  if (state.logDate) {
    msg = `${message} at ${now.toLocaleTimeString()}.`;
  }
  state.logs.push(`${now.getTime()} - ${msg}`);
};

const run = (method, n, i, a, state) => {
  if (state.status === STATUS.KILLING) {
    setTimeout(() => {
      // eslint-disable-next-line no-param-reassign
      state.status = STATUS.KILLED;
      log(state, 'KILLED');
    }, DELAY_KILL);
    return;
  }
  if (state.status !== STATUS.IN_PROGRESS) {
    if (!state.region) {
      setTimeout(() => {
        log(state, 'Error: Region undefined');
        // eslint-disable-next-line no-param-reassign
        state.status = STATUS.ERROR;
      }, DELAY_ERROR);
      return;
    }
    log(state, `Launching process in region ${state.region}`);
    // eslint-disable-next-line no-param-reassign
    state.status = STATUS.IN_PROGRESS;
  }
  let acc = a;
  if (i === 0) {
    acc = method.init();
  }
  let pi;
  try {
    pi = method.calc(acc);
  } catch (e) {
    log(state, `Error: ${e.message}: ${e.stack}`);
    // eslint-disable-next-line no-param-reassign
    state.status = STATUS.ERROR;
    return;
  }
  log(state, `Iteration #${i}: ${pi}`);
  if (i === n) {
    log(state, 'Finished');
    // eslint-disable-next-line no-param-reassign
    state.status = STATUS.FINISHED;
  } else {
    setTimeout(() => run(method, n, i + 1, acc, state), DELAY_STEP);
  }
};

const demoApp = express();

demoApp.get('/methods', (req, res) => {
  res.send(methods.map((method) => ({ id: method.id, name: method.name })));
});

const getMethod = (id) => methods[methods.findIndex((method) => method.id === id)];

const getJobState = (id) => jobStates[jobStates.findIndex((jobState) => jobState.id === id)];

demoApp.post('/start', (req, res) => {
  const method = getMethod(req.body.method);
  if (method) {
    const jobState = {
      id: jobId.toString(),
      status: STATUS.STARTING,
      date: Date(),
      method,
      region: req.body.region,
      logDate: req.body.logDate,
      n: req.body.n,
      logs: [],
    };
    jobStates.push(jobState);
    res.send({ id: jobId.toString() });
    jobId += 1;
    setTimeout(() => run(method, parseInt(req.body.n, 10), 0, null, jobState), DELAY_RUN);
  } else {
    res.status(404).send(`method not found '${req.body.method}'`);
  }
});

demoApp.post('/stop', (req, res) => {
  const jobState = getJobState(req.body.id);
  if (jobState) {
    if (jobState.status !== STATUS.STARTING && jobState.status !== STATUS.IN_PROGRESS) {
      res.status(420).send(`Job already stopped: ${jobState.status}`);
    } else {
      jobState.status = STATUS.KILLING;
      res.send({ status: STATUS.KILLING });
    }
  } else {
    res.status(404).send(`job not found '${req.body.id}'`);
  }
});

demoApp.get('/logs', (req, res) => {
  const jobState = getJobState(req.query.id);
  if (jobState) {
    for (let i = 0; i < jobState.logs.length; i += 1) {
      setTimeout(() => {
        // eslint-disable-next-line security/detect-object-injection
        res.write(jobState.logs[i]);
        res.write('\n');
      }, DELAY_LOG * i);
    }
    setTimeout(() => res.end(), DELAY_LOG * jobState.logs.length);
  } else {
    res.status(404).send(`job not found '${req.query.id}'`);
  }
});

demoApp.get('/state', (req, res) => {
  const jobState = getJobState(req.query.id);
  if (jobState) {
    res.send({
      status: jobState.status,
      date: jobState.date,
    });
  } else {
    res.status(404).send(`job not found '${req.query.id}'`);
  }
});

module.exports = demoApp;
