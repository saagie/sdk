import React, {
  createContext, useContext, useState, useCallback, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { useYAMLConfigContext } from './YAMLConfigContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: '',
};

export const FormContext = createContext();
export const useFormContext = () => useContext(FormContext);

const buildFormValues = (current, formValues) =>
  current?.parameters?.reduce((obj, param) => {
    // only build the form with values which are part of the actual parameters, thus handle when
    // parameter ids change
    // eslint-disable-next-line no-param-reassign
    obj[param.id] = formValues[param.id] ?? param.defaultValue;
    return obj;
  }, {});

export function FormContextProvider({ children }) {
  const { config, currentContext, currentConnectionType } = useYAMLConfigContext();
  const { setItem, getItem } = useLocalStorage(
    `${config?.technology?.id}.${currentContext?.id}.formValues`,
  );

  const [formValues, setFormValues] = useState();

  const updateForm = useCallback((form, { name, value }) => {
    setFormValues((state) => {
      const newState = {
        ...(state || {}),
        [form]: {
          ...(state || {})[form],
          [name]: value,
        },
      };

      setItem(newState);

      return newState;
    });
  }, [setItem]);

  const filteredFormValues = useMemo(() => {
    const allFormValues = formValues ?? getItem() ?? {};
    const parametersFormValues = buildFormValues(
      currentContext,
      allFormValues?.parameters ?? {},
    );
    const connectionFormValues = buildFormValues(
      currentConnectionType,
      allFormValues?.connection ?? {},
    );
    return {
      ...allFormValues,
      parameters: parametersFormValues,
      connection: connectionFormValues,
    };
  }, [currentContext, currentConnectionType, formValues, getItem]);

  const context = useMemo(() => ({
    formValues: filteredFormValues,
    updateForm,
    clearForm: (name) => {
      setFormValues((state) => {
        const newState = {
          ...(state ?? getItem() ?? {}),
          [name]: {},
        };
        setItem(newState);
        return newState;
      });
    },
  }), [updateForm, filteredFormValues, getItem, setItem]);

  return (
    <FormContext.Provider value={context}>
      {children}
    </FormContext.Provider>
  );
}

FormContextProvider.propTypes = propTypes;
FormContextProvider.defaultProps = defaultProps;
