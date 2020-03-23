import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  FormGroup,
  FormControlInput,
  FormPassword,
  FormControlSelect,
} from 'saagie-ui/react';

const propTypes = {
  onUpdate: PropTypes.func,
  formName: PropTypes.string.isRequired,
  formValues: PropTypes.object,
  contextFolderPath: PropTypes.string,
  field: PropTypes.object,
};

const defaultProps = {
  onUpdate: () => {},
  formValues: {},
  contextFolderPath: '',
  field: {},
};

export const SmartField = ({
  onUpdate = () => {},
  formValues = {},
  formName,
  contextFolderPath,
  field: {
    type,
    name,
    label,
    required,
    helper,
    options,
    dependsOn,
  },
}) => {
  const [error, setError] = useState();
  const onUpdateRef = useRef();
  const currentForm = formValues?.[formName] || {};
  onUpdateRef.current = onUpdate;

  const currentFormRef = useRef();
  currentFormRef.current = currentForm;

  const shouldBeDisplayed = !dependsOn || dependsOn?.every((x) => currentForm[x]);

  const dependsOnValues = JSON.stringify(dependsOn?.map((x) => currentForm[x]));

  useEffect(() => {
    onUpdateRef.current({ name, value: undefined });
  },
  [
    name,
    shouldBeDisplayed,
    dependsOnValues,
  ]);

  const getField = () => {
    switch (type) {
    case 'TEXT':
      return (
        <FormControlInput
          name={name}
          autoComplete={name}
          onChange={(e) => onUpdate({ name, value: e.target.value })}
        />
      );

    case 'URL':
      return (
        <FormControlInput
          name={name}
          autoComplete={name}
          type="url"
          onChange={(e) => onUpdate({ name, value: e.target.value })}
        />
      );

    case 'PASSWORD':
      return (
        <FormPassword
          name={name}
          autoComplete={name}
          onChange={(e) => onUpdate({ name, value: e.target.value })}
        />
      );

    case 'SELECT':
      return (
        <FormControlSelect
          name={name}
          onChange={({ value, ...item }) => onUpdate({ name, value: { ...item, id: value } })}
          isAsync
          cacheOptions
          defaultOptions
          loadOptions={async () => {
            setError(null);

            if (
              !shouldBeDisplayed
              || !options
              || !options.script
              || !options.function
            ) {
              return options;
            }

            try {
              const { data } = await axios.post('/api/action', {
                script: `${contextFolderPath}/${options.script}`,
                function: options.function,
                params: {
                  formParams: currentFormRef.current,
                },
              });

              return data?.map((x) => ({ value: x.id, label: x.label }));
            } catch (err) {
              setError(err.response?.data);
            }

            return [];
          }}
        />
      );

    case 'ENDPOINT':
      return (
        <FormControlSelect
          name={name}
          isClearable
          options={[{ value: formValues?.endpoint, label: 'Use test endpoint' }]}
          onChange={(value) => onUpdate({ name, value: value ? formValues?.endpoint : undefined })}
        />
      );

    case 'ARTIFACT':
      return type;

    case 'COMMAND_LINE':
      return type;

    default:
      return type;
    }
  };

  if (!shouldBeDisplayed) {
    return '';
  }

  return (
    <FormGroup
      key={dependsOnValues}
      label={label}
      helper={helper}
      isOptional={!required}
      validationState={error ? 'danger' : undefined}
      feedbackMessage={error ? error.message : undefined}
    >
      {getField()}
    </FormGroup>
  );
};

SmartField.propTypes = propTypes;
SmartField.defaultProps = defaultProps;
