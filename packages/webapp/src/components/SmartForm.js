import React from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';

const propTypes = {
  name: PropTypes.string.isRequired,
  formValues: PropTypes.object,
  updateForm: PropTypes.func,
};

const defaultProps = {
  formValues: {},
  updateForm: () => {},
};

export const SmartForm = ({
  name,
  formValues,
  updateForm,
}) => {
  const { selectedContext } = useYAMLConfigContext();

  return (
    <>
      {!selectedContext?.[name]?.features?.length && (
        <div className="sui-m-message as--light as--warning">
          No features
        </div>
      )}
      <form autoComplete="off">
        {selectedContext?.[name]?.features?.map((field) => (
          <SmartField
            key={field.name}
            field={field}
            formName={name}
            formValues={formValues}
            contextFolderPath={selectedContext?.__folderPath}
            onUpdate={updateForm(name)}
          />
        ))}
      </form>
    </>
  );
};

SmartForm.propTypes = propTypes;
SmartForm.defaultProps = defaultProps;
