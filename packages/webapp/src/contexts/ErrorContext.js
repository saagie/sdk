import React, { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: '',
};

export const ErrorContext = createContext();
export const useErrorContext = () => useContext(ErrorContext);

export const ErrorContextProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);

  const addError = (error) => {
    setErrors((prev) => [...prev, { ...error, id: uuid() }]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        clearErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

ErrorContextProvider.propTypes = propTypes;
ErrorContextProvider.defaultProps = defaultProps;
