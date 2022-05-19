import React, { useState } from 'react';
import { Button, FormFeedback } from 'saagie-ui/react';
import PropTypes from 'prop-types';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';
import { useScriptCallMutation } from '../contexts/ScriptCallHistoryContext';

const propTypes = {
  ready: PropTypes.bool.isRequired,
};

const defaultProps = {};

export function CheckConnection({ ready }) {
  const [status, setStatus] = useState();
  const [error, setError] = useState();

  const { currentConnectionType } = useYAMLConfigContext();
  const { formValues } = useFormContext();

  const { actions } = currentConnectionType || {};

  const {
    mutateAsync: callCheckConnection,
    status: getCheckConnectionStatus,
  } = useScriptCallMutation(
    currentConnectionType?.__folderPath,
    actions.checkConnection,
    {
      connection: formValues.connection,
    },
    {},
    (res) => {
      setError(null);
      setStatus(res.payload);
    },
    (err) => {
      setStatus(null);
      setError(`checkConnection error: ${err?.response?.data?.error?.message}`);
    },
  );

  return (
    <>
      <div className="sui-g-grid as--start as--middle as--auto">
        <div className="sui-g-grid__item">
          <Button
            onClick={() => callCheckConnection()}
            isLoading={getCheckConnectionStatus === 'loading'}
            isDisabled={!ready}
          >
            Check Connection
          </Button>
        </div>
      </div>
      { error && <FormFeedback color="danger">{error}</FormFeedback>}
      { status?.ok === true && <FormFeedback color="success">{JSON.stringify(status, null, 2)}</FormFeedback>}
      { status && status?.ok !== true && <FormFeedback color="warning">{JSON.stringify(status, null, 2)}</FormFeedback>}
    </>
  );
}

CheckConnection.propTypes = propTypes;
CheckConnection.defaultProps = defaultProps;
