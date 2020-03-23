import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { PageEmptyState, Button } from 'saagie-ui/react';
import { Status } from 'saagie-ui/react/projects';
import axios from 'axios';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';

const propTypes = {
  formValues: PropTypes.object,
};

const defaultProps = {
  formValues: {},
};

function useQuery() {
  return new URLSearchParams(window.location.search);
}

export const Actions = ({
  formValues,
}) => {
  const [status, setStatus] = useState('created');
  const [isRunActionLoading, setIsRunActionLoading] = useState(false);
  const [isStopActionLoading, setIsStopActionLoading] = useState(false);

  const { selectedContext } = useYAMLConfigContext();

  const query = useQuery();

  const {
    __folderPath: contextFolderPath,
    instance,
  } = selectedContext || {};

  const { actions } = instance || {};
  const {
    onStart,
    onStop,
    getStatus,
    // getLogs,
  } = actions || {};

  const isDebugMode = query.get('debug') !== null;


  const fetchStatus = async () => {
    try {
      const response = await axios.post('/api/action', {
        script: `${contextFolderPath}/${getStatus?.script}`,
        function: getStatus?.function,
        params: {
          formParams: formValues.job,
          // name: 'job_name'
        },
      });

      setStatus(response.data.data);

      setIsRunActionLoading(false);
    } catch (err) {
      setIsRunActionLoading(false);
    }
  };

  const handleRunAction = async () => {
    setIsRunActionLoading(true);

    try {
      await axios.post('/api/action', {
        script: `${contextFolderPath}/${onStart?.script}`,
        function: onStart?.function,
        params: {
          formParams: formValues.job,
          // name: 'job_name'
        },
      });

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
          formParams: formValues.job,
          // name: 'job_name'
        },
      });

      setStatus('killed');
      setIsStopActionLoading(false);
    } catch (err) {
      setIsStopActionLoading(false);
    }
  };

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
              {status !== 'created' && (
                <div className="sui-g-grid__item as--1_6">
                  <Status name={status?.toLowerCase() ?? ''} size="xl" />
                </div>
              )}
            </div>
          </>
        )
      }
    </>
  );
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;
