import React, { useState } from 'react';
import {
  Button, EmptyState, FormFeedback, Tooltip,
} from 'saagie-ui/react';
import { Status } from 'saagie-ui/react/projects';
import PropTypes from 'prop-types';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';
import { Logs } from './Logs/index';
import { useScriptCallMutation } from '../contexts/ScriptCallHistoryContext';

const propTypes = {
  ready: PropTypes.bool.isRequired,
};

const defaultProps = {};

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

export function Actions({ ready }) {
  const [payload, setPayload] = useState();
  const [jobStatus, setJobStatus] = useState();
  const [logs, setLogs] = useState();
  const [error, setError] = useState();

  const { currentContext } = useYAMLConfigContext();
  const { formValues } = useFormContext();

  const { actions } = currentContext || {};

  const {
    start,
    stop,
    getStatus,
    getLogs,
  } = actions || {};

  const {
    mutateAsync: callGetStatus,
    status: getJobStatusStatus,
  } = useScriptCallMutation(getStatus,
    {
      connection: formValues.connection,
      parameters: formValues.parameters,
      payload,
    },
    (data) => { setError(null); setJobStatus(data.data); },
    (err) => setError(`getStatus error: ${err?.response?.data?.message}`),
  );

  const {
    mutateAsync: callStart,
    status: runJobStatus,
  } = useScriptCallMutation(start,
    {
      connection: formValues.connection,
      parameters: formValues.parameters,
    },
    (data) => { setError(null); setPayload(data.data); },
    (err) => setError(`start error: ${err?.response?.data?.message}`),
  );

  const {
    mutateAsync: callStop,
    status: stopJobStatus,
  } = useScriptCallMutation(stop,
    {
      connection: formValues.connection,
      parameters: formValues.parameters,
      payload,
    },
    () => { setError(null); },
    (err) => setError(`stop error: ${err?.response?.data?.message}`),
  );

  const {
    mutateAsync: callGetLogs,
    status: getJobLogsStatus,
  } = useScriptCallMutation(getLogs,
    {
      connection: formValues.connection,
      parameters: formValues.parameters,
      payload,
    },
    (res) => {
      setError(null);
      setLogs(
        res.data.flatMap(
          (log) => log.log
            .split(/\r\n|\n\r|\n|\r/)
            .map((l) => ({ ...log, log: l })),
        ),
      );
    },
    (err) => setError(`getLogs error: ${err?.response?.data?.message}`),
  );

  const reset = () => {
    setPayload(null);
    setJobStatus(null);
    setLogs(null);
    setError(null);
  };

  function awaitFinishedStatus(resolve, reject) {
    callGetStatus()
      .then((status) => {
        if (status?.data === 'SUCCEEDED' || status?.data === 'KILLED' || status?.data === 'FAILED') {
          resolve();
        } else {
          setTimeout(() => awaitFinishedStatus(resolve, reject), 2000);
        }
      })
      .catch((err) => reject(err));
  }

  const runJob = async () => {
    await callStart();
    await new Promise(awaitFinishedStatus);
    if (getLogs) {
      await callGetLogs();
    }
  };

  return (
    <>
      <h3>
        <div className="sui-g-grid as--no-wrap">
          <span className="sui-g-grid__item">
            Instance Actions
          </span>
          <Button className="sui-g-grid__item as--push as--middle" onClick={() => reset()}>Reset</Button>
        </div>
      </h3>
      <div className="sui-g-grid as--start as--middle as--auto">
        <div className="sui-g-grid__item">
          <Button
            color="action-play"
            onClick={() => runJob()}
            isDisabled={!ready || !!payload}
          >
            Run
          </Button>
        </div>
        {jobStatus && (
          <div className="sui-g-grid__item as--push">
            {
              Object.values(JobStatus).find(
                (value) => value.toLowerCase() === jobStatus.toLowerCase())
                ? <Status name={jobStatus.toLowerCase() ?? ''} size="xl" />
                : (
                  <Status name="" size="xl">
                    {jobStatus.toUpperCase()}
                    <Tooltip
                      defaultPlacement="left"
                      label={(
                        <div>
                          Not supported, go to <a href="https://go.saagie.com/design-system" target="_blank" rel="noopener noreferrer">Saagie Design System</a> for supported status
                        </div>
                      )}
                      hideDelay
                      hideDelayCustomTimeOut={1}
                    >
                      <i className="sui-a-icon as--fa-info-circle as--end" />
                    </Tooltip>
                  </Status>
                )
            }
          </div>
        )}
      </div>
      <div className="sui-g-grid as--start as--middle as--auto">
        <div className="sui-g-grid__item">
          <Button
            onClick={() => callStart()}
            isLoading={runJobStatus === 'loading'}
            isDisabled={!ready || !!payload}
          >
            <tt>start</tt>
          </Button>
        </div>
        {stop && (
          <div className="sui-g-grid__item">
            <Button
              onClick={() => callStop()}
              isLoading={stopJobStatus === 'loading'}
              isDisabled={!ready || !payload}
            >
              <tt>stop</tt>
            </Button>
          </div>
        )}
        {getStatus && (
          <div className="sui-g-grid__item">
            <Button
              onClick={() => callGetStatus()}
              isLoading={getJobStatusStatus === 'loading'}
              isDisabled={!ready || !payload}
            >
              <tt>getStatus</tt>
            </Button>
          </div>
        )}
        {getLogs && (
          <div className="sui-g-grid__item">
            <Button
              onClick={() => callGetLogs()}
              isLoading={getJobLogsStatus === 'loading'}
              isDisabled={!ready || !payload}
            >
              <tt>getLogs</tt>
            </Button>
          </div>
        )}
      </div>
      { error && <FormFeedback color="danger">{error}</FormFeedback>}
      <div className="sui-g-grid">
        <div className="sui-g-grid__item">
          {payload
            ? (<pre>{JSON.stringify(payload, null, 2)}</pre>)
            : (<EmptyState icon="settings-exec" content="No instance payload" />)}
        </div>
      </div>
      <div className="sui-g-grid">
        <div className="sui-g-grid__item">
          <div style={{ height: '60vh' }}>
            <Logs logs={logs} />
          </div>
        </div>
      </div>
    </>
  );
}

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;
