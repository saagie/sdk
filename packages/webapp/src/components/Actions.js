import React, { useState, useEffect } from 'react';
import { PageEmptyState, Button } from 'saagie-ui/react';
import { Status } from 'saagie-ui/react/projects';
import axios from 'axios';
import { useMutation } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';
import { Logs } from './Logs/index';

const propTypes = {};
const defaultProps = {};

function useDebug() {
  const query = new URLSearchParams(window.location.search);
  return query.get('debug') !== null;
}

export const Actions = () => {
  const [lastInstance, setLastInstance] = useState();
  const [logs, setLogs] = useState();

  const isDebugMode = useDebug();

  const { selectedContext } = useYAMLConfigContext();
  const { formValues } = useFormContext();

  const {
    __folderPath: contextFolderPath,
    instance,
  } = selectedContext || {};

  const { actions } = instance || {};
  const {
    onStart,
    onStop,
    getStatus,
    getLogs,
  } = actions || {};

  const createInstance = () => {
    const newInstance = {
      id: uuidv4(),
    };

    setLastInstance(newInstance);

    return newInstance;
  };

  const [getJobStatus, { status: getJobStatusStatus, data: jobStatus }] = useMutation(() => axios.post('/api/action', {
    script: `${contextFolderPath}/${getStatus?.script}`,
    function: getStatus?.function,
    params: {
      job: { featuresValues: formValues.job },
      instance: lastInstance,
    },
  }));

  const [runJob, { status: runJobStatus, data: instancePayloadResponse }] = useMutation(() => axios.post('/api/action', {
    script: `${contextFolderPath}/${onStart?.script}`,
    function: onStart?.function,
    params: {
      job: { featuresValues: formValues.job },
      instance: createInstance(),
    },
  }));

  const [stopJob, { status: stopJobStatus }] = useMutation(() => axios.post('/api/action', {
    script: `${contextFolderPath}/${onStop?.script}`,
    function: onStop?.function,
    params: {
      job: { featuresValues: formValues.job },
      instance: lastInstance,
    },
  }));

  const [getJobLogs, { status: getJobLogsStatus }] = useMutation(() => axios.post('/api/action', {
    script: `${contextFolderPath}/${getLogs?.script}`,
    function: getLogs?.function,
    params: {
      job: { featuresValues: formValues.job },
      instance: lastInstance,
    },
  }), {
    onSuccess: (res) => setLogs(res.data),
  });

  useEffect(() => {
    setLastInstance((i) => ({
      ...i,
      payload: instancePayloadResponse?.data,
    }));
  }, [instancePayloadResponse]);

  return (
    <>
      {
        isDebugMode ? (
          <PageEmptyState title="Debug">
            <pre className="sui-h-text-left">
              {JSON.stringify(selectedContext, null, 2)}
            </pre>
          </PageEmptyState>
        ) : (
          <>
            <div className="sui-g-grid as--start as--middle as--auto">
              <div className="sui-g-grid__item">
                <Button
                  color="action-play"
                  onClick={() => runJob()}
                  isLoading={runJobStatus === 'loading'}
                >
                  Run
                </Button>
              </div>
              <div className="sui-g-grid__item">
                <Button
                  color="action-stop"
                  onClick={() => stopJob()}
                  isLoading={stopJobStatus === 'loading'}
                >
                  Stop
                </Button>
              </div>
              <div className="sui-g-grid__item">
                <Button
                  onClick={() => getJobStatus()}
                  isLoading={getJobStatusStatus === 'loading'}
                >
                  Get Status
                </Button>
              </div>
              <div className="sui-g-grid__item">
                <Button
                  onClick={() => getJobLogs()}
                  isLoading={getJobLogsStatus === 'loading'}
                >
                  Get Logs
                </Button>
              </div>
              {jobStatus?.data && (
                <div className="sui-g-grid__item">
                  <Status name={jobStatus?.data?.toLowerCase() ?? ''} size="xl" />
                </div>
              )}
            </div>
            <div className="sui-g-grid">
              <div className="sui-g-grid__item">
                <div style={{ height: '60vh' }}>
                  <Logs logs={logs} />
                </div>
              </div>
            </div>
          </>
        )
      }
    </>
  );
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;
