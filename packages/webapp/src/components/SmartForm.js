import React from 'react';
import PropTypes from 'prop-types';
import { SmartField } from './SmartField';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';

const propTypes = {
  name: PropTypes.string.isRequired,
};

const defaultProps = {};

export const SmartForm = ({ name }) => {
  const { selectedContext } = useYAMLConfigContext();
  const { formValues, updateForm } = useFormContext();

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
