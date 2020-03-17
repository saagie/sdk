import React from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';

const propTypes = {
  name: PropTypes.string.isRequired,
  contextConfig: PropTypes.object,
  formValues: PropTypes.object,
  updateForm: PropTypes.func,
};

const defaultProps = {
  contextConfig: {},
  formValues: {},
  updateForm: () => {},
};

export const SmartForm = ({
  name,
  contextConfig,
  formValues,
  updateForm,
}) => (
  <>
    {!contextConfig?.[name]?.features?.length && (
      <div className="sui-m-message as--light as--warning">
        No features
      </div>
    )}
    <form autoComplete="off">
      {contextConfig?.[name]?.features?.map((field) => (
        <SmartField
          key={field.name}
          field={field}
          formName={name}
          formValues={formValues}
          contextFolderPath={contextConfig?.__folderPath}
          onUpdate={updateForm(name)}
        />
      ))}
    </form>
  </>
);

SmartForm.propTypes = propTypes;
SmartForm.defaultProps = defaultProps;
