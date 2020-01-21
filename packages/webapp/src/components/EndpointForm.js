import React from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';

const propTypes = {
  contextConfig: PropTypes.object,
  endpointForm: PropTypes.object,
  setEndpointForm: PropTypes.func,
};

const defaultProps = {
  contextConfig: {},
  endpointForm: {},
  setEndpointForm: () => {},
};

export const EndpointForm = ({
  contextConfig,
  endpointForm,
  setEndpointForm,
}) => (
  <>
    <h3>Endpoint form</h3>
    {!contextConfig?.endpoint?.features?.length && (
      <div className="sui-m-message as--light as--warning">
        No features
      </div>
    )}
    <form autoComplete="off">
      {contextConfig?.endpoint?.features?.map((field) => (
        <SmartField
          key={field.name}
          field={field}
          currentForm={endpointForm}
          contextFolderPath={contextConfig?.__folderPath}
          onUpdate={({ name, value }) => setEndpointForm((s) => {
            const ns = { ...s };
            ns[name] = value;
            return ns;
          })}
        />
      ))}
    </form>
  </>
);

EndpointForm.propTypes = propTypes;
EndpointForm.defaultProps = defaultProps;
