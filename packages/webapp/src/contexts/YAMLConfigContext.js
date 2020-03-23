import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import fetch from '../utils/fetch';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: '',
};

export const YAMLConfigContext = createContext();
export const useYAMLConfigContext = () => useContext(YAMLConfigContext);

export const YAMLConfigContextProvider = ({ children }) => {
  const [selectedContext, setSelectedContext] = useState();

  const { status, data: config } = useQuery('config', () => fetch('/api/config'));

  useEffect(() => {
    setSelectedContext(config?.contexts?.[0]);
  }, [config]);

  const changeContext = useCallback((id) => {
    setSelectedContext(config?.contexts?.find((context) => context.id === id));
  }, [config]);

  return (
    <YAMLConfigContext.Provider value={{
      config,
      selectedContext,
      changeContext,
      status,
    }}
    >
      {children}
    </YAMLConfigContext.Provider>
  );
};

YAMLConfigContextProvider.propTypes = propTypes;
YAMLConfigContextProvider.defaultProps = defaultProps;
