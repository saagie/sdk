import React from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';

const propTypes = {
  name: PropTypes.string.isRequired,
  parameters: PropTypes.array,
  dependencyReady: PropTypes.bool,
};

const defaultProps = {
  parameters: [],
  dependencyReady: true,
};

export function SmartForm({ name, parameters, dependencyReady }) {
  return (
    <>
      {!parameters?.length && (
        <div className="sui-m-message as--light as--warning">
          No features
        </div>
      )}
      <form autoComplete="off">
        {parameters?.map((parameter) => (
          <SmartField
            key={parameter.id}
            parameter={parameter}
            formName={name}
            dependencyReady={dependencyReady}
          />
        ))}
      </form>
    </>
  );
}

SmartForm.propTypes = propTypes;
SmartForm.defaultProps = defaultProps;
