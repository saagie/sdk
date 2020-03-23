import React, {
  createContext, useContext, useState, useCallback,
} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: '',
};

export const FormContext = createContext();
export const useFormContext = () => useContext(FormContext);

export const FormContextProvider = ({ children }) => {
  const [formValues, setFormValues] = useState({});

  const updateForm = useCallback((form) => ({ name, value }) => {
    setFormValues((state) => ({
      ...state,
      [form]: {
        ...state[form],
        [name]: value,
      },
    }));
  }, []);

  return (
    <FormContext.Provider value={{
      formValues,
      updateForm,
    }}
    >
      {children}
    </FormContext.Provider>
  );
};

FormContextProvider.propTypes = propTypes;
FormContextProvider.defaultProps = defaultProps;
