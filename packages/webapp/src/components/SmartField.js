import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup,
  FormCheck,
  FormControlInput,
  FormPassword,
  FormControlSelect, FormFeedback,
} from 'saagie-ui/react';
import { useScriptCall } from '../contexts/ScriptCallHistoryContext';
import { useFormContext } from '../contexts/FormContext';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';

const propTypes = {
  formName: PropTypes.string.isRequired,
  parameter: PropTypes.object,
  dependencyReady: PropTypes.bool,
};

const defaultProps = {
  parameter: {},
  dependencyReady: true,
};

export function SmartField({
  formName,
  dependencyReady,
  parameter: {
    type,
    id,
    label,
    mandatory,
    comment,
    dynamicValues,
    staticValues,
    dependsOn,
    defaultValue,
  },
}) {
  const { formValues, updateForm } = useFormContext();
  const { currentContext } = useYAMLConfigContext();

  const missingDependencies = dependsOn
    ?.filter((paramId) => !formValues?.[formName]?.[paramId]) ?? [];

  const ready = dependencyReady && missingDependencies.length === 0;

  const { data: fetchedDynamicValues, error: fetchError } = useScriptCall(
    [formValues, dynamicValues],
    currentContext?.__folderPath,
    dynamicValues,
    formValues,
    ready,
  );

  const currentForm = formValues?.[formName] || {};

  const currentFormRef = useRef();
  currentFormRef.current = currentForm;

  const fieldValue = currentForm[id];

  const requireError = !fieldValue && mandatory;

  const getField = () => {
    switch (type) {
    case 'TOGGLE': {
      return (
        <FormCheck
          key={id}
          name={id}
          defaultChecked={defaultValue}
          onChange={(e) => updateForm(formName, { name: id, value: e.target.value === 'on' })}
          disabled={!ready}
        >{label || ''}
        </FormCheck>
      );
    }

    case 'TEXT':
      return (
        <FormControlInput
          name={id}
          value={fieldValue || ''}
          onChange={(e) => updateForm(formName, { name: id, value: e.target.value })}
          required={mandatory}
          disabled={!ready}
        />
      );

    case 'PASSWORD':
      return (
        <FormPassword
          name={id}
          value={fieldValue || ''}
          autoComplete={id}
          onChange={(e) => updateForm(formName, { name: id, value: e.target.value })}
          disabled={!ready}
        />
      );

    case 'STATIC_SELECT': {
      const defaultStaticValue = defaultValue
        ? staticValues?.filter((v) => v.id === defaultValue)?.[0]
        : null;
      return (
        <FormControlSelect
          // Used to avoid long label to be cropped when selected. Closes #65.
          // By adding this prop, it also remove the horizontal scrollbar.
          menuPortalTarget={document.body}
          name={id}
          onChange={({ value }) => updateForm(formName, { name: id, value })}
          value={fieldValue ? staticValues?.filter((v) => v.id === fieldValue)?.[0] : null}
          defaultValue={defaultStaticValue}
          options={staticValues?.map((x) => ({ value: x.id, label: x.label, payload: x }))}
          disabled={!ready}
        />
      );
    }
    case 'DYNAMIC_SELECT': {
      let options = [];
      let dynamicValue = null;
      let dynamicValuesError = null;
      if (fetchedDynamicValues) {
        if (Array.isArray(fetchedDynamicValues.payload[0])) {
          options = fetchedDynamicValues?.payload[0]
            ?.map((x) => ({ value: x.id, label: x.label, payload: x }))
            ?? [];
          dynamicValue = fieldValue
            ? fetchedDynamicValues?.payload[0]?.filter((v) => v.id === fieldValue)?.[0]
            : null;
        } else {
          dynamicValuesError = `Expecting an array of { id, label } returned by the function '${dynamicValues.function}', but was '${fetchedDynamicValues.payload[0]}'`;
        }
      }
      return (
        <>
          <FormControlSelect
            // Used to avoid long label to be cropped when selected. Closes #65.
            // By adding this prop, it also remove the horizontal scrollbar.
            menuPortalTarget={document.body}
            name={id}
            onChange={({ value }) => updateForm(formName, { name: id, value })}
            value={dynamicValue}
            options={options}
            disabled={!ready}
          />
          {dynamicValuesError && <FormFeedback color="danger">{dynamicValuesError}</FormFeedback>}
        </>
      );
    }

    default:
      return type;
    }
  };

  let validationState;
  if (fetchError) {
    validationState = 'danger';
  } else if (!ready) {
    validationState = 'warning';
  } else if (requireError) {
    validationState = 'danger';
  }

  let feedbackMessage;
  if (fetchError) {
    feedbackMessage = fetchError.response?.data?.error?.message ?? fetchError.message;
  } else if (!dependencyReady) {
    feedbackMessage = 'Dependant form not ready';
  } else if (missingDependencies?.length > 0) {
    feedbackMessage = `Missing dependencies: ${missingDependencies}`;
  } else if (requireError) {
    feedbackMessage = 'Required';
  }

  return (
    <FormGroup
      key={id}
      label={type === 'TOGGLE' ? '' : label}
      helper={comment}
      isOptional={!mandatory}
      validationState={validationState}
      feedbackMessage={feedbackMessage}
    >
      {getField()}
    </FormGroup>
  );
}

SmartField.propTypes = propTypes;
SmartField.defaultProps = defaultProps;
