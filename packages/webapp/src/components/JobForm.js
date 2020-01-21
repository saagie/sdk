import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';

const propTypes = {
  contextConfig: PropTypes.object,
  endpointForm: PropTypes.object,
};

const defaultProps = {
  contextConfig: {},
  endpointForm: {},
};


export const JobForm = ({
  contextConfig,
  endpointForm,
}) => {
  const [jobForm, setJobForm] = useState({});

  return (
    <>
      <h3>Job form</h3>
      {!contextConfig?.job?.features?.length && (
        <div className="sui-m-message as--light as--warning">
          No fields
        </div>
      )}
      <form autoComplete="off">
        {contextConfig?.job?.features?.map((field) => (
          <SmartField
            key={field.name}
            field={field}
            endpointForm={endpointForm}
            currentForm={jobForm}
            contextFolderPath={contextConfig?.__folderPath}
            onUpdate={({ name, value }) => setJobForm((s) => {
              const ns = { ...s };
              ns[name] = value;
              return ns;
            })}
          />
        ))}
      </form>
    </>
  );
};

JobForm.propTypes = propTypes;
JobForm.defaultProps = defaultProps;
