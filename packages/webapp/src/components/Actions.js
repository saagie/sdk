import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PageEmptyState, Button } from 'saagie-ui/react';
import { Status } from 'saagie-ui/react/projects';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import axios from 'axios';

const propTypes = {
  contextConfig: PropTypes.object,
};

const defaultProps = {
  contextConfig: {},
};

function useQuery() {
  return new URLSearchParams(window.location.search);
}

const INTERVAL_FETCH_LOGS = 15000;

export const Actions = ({
  contextConfig,
}) => {
  const [logs, setLogs] = useState('');
  const [isRunActionLoading, setIsRunActionLoading] = useState(false);
  const [isStopActionLoading, setIsStopActionLoading] = useState(false);

  // We store the fetch logs interval key in here
  const intervalRef = useRef();

  const stopFetchLogsInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = undefined;
  };

  // Clear interval before unmount
  useEffect(() => {
    return () => {
      stopFetchLogsInterval();
    };
  }, []);

  const query = useQuery();

  const {
    _folder: contextFolderPath,
    instance,
  } = contextConfig || {};

  const { actions} = instance || {};
  const {
    onStart,
    onStop,
    getLogs,
  } = actions || {};
  
  const isDebugMode = query.get('debug') !== null;

  const fetchLogs = async () => {
    try {
      const data = await axios.post('/api/action', {
        script: `${contextFolderPath}/${getLogs?.script}`,
        function: getLogs?.function,
        params: {
          // custom: currentFormRef.current,
          // name: 'job_name'
        },
      });

      setLogs(data);

      setIsRunActionLoading(false);
    } catch (err) {
      setIsRunActionLoading(false);
    }
  };

  const startLogsPolling = () => {
    fetchLogs();

    intervalRef.current = setInterval(() => {
      console.log('Fetching logs');
      fetchLogs();
    }, INTERVAL_FETCH_LOGS);
  };

  const handleRunAction = async () => {
    setIsRunActionLoading(true);

    try {
      await axios.post('/api/action', {
        script: `${contextFolderPath}/${onStart?.script}`,
        function: onStart?.function,
        params: {
          // custom: currentFormRef.current,
          // name: 'job_name'
        },
      });

      startLogsPolling();
      setIsRunActionLoading(false);
    } catch (err) {
      setIsRunActionLoading(false);
    }
  };

  const handleStopAction = async () => {
    setIsStopActionLoading(true);

    try {
      await axios.post('/api/action', {
        script: `${contextFolderPath}/${onStop?.script}`,
        function: onStop?.function,
        params: {
          // custom: currentFormRef.current,
          // name: 'job_name'
        },
      });

      stopFetchLogsInterval();
      setIsStopActionLoading(false);
    } catch (err) {
      setIsStopActionLoading(false);
    }
  };

  return (
    <>
      <h3>Instance Actions</h3>
      {
        isDebugMode ? (
          <PageEmptyState title="Debug">
            <pre className="sui-h-text-left">
              {JSON.stringify(contextConfig, null, 2)}
            </pre>
          </PageEmptyState>
        ) : (
          <>
            <div className="sui-g-grid as--start as--middle">
              <div className="sui-g-grid__item as--1_6">
                <Button
                  color="action-play"
                  onClick={handleRunAction}
                  isLoading={isRunActionLoading}
                  disabled={isStopActionLoading}
                >
                  Run
                </Button>
              </div>
              <div className="sui-g-grid__item as--1_6">
                <Button
                  color="action-stop"
                  onClick={handleStopAction}
                  isLoading={isStopActionLoading}
                >
                  Stop
                </Button>
              </div>
              <div className="sui-g-grid__item as--1_6">
                <Status name="running" size="xl" />
              </div>
              <div className="sui-g-grid__item as--1_1">
                <CodeMirror
                  value={logs}
                  options={{
                    lineNumbers: true,
                    readOnly: true,
                  }}
                />
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
