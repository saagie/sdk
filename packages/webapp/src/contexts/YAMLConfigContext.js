import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useQuery } from 'react-query';
import axios from 'axios';
import { useLocalStorage } from '../hooks/useLocalStorage';

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


  const { status, data: config } = useQuery('config', () => axios('/api/config'));

  const { setItem, getItem } = useLocalStorage(
    `${config?.technology?.id}.selectedContextId`,
  );

  useEffect(() => {
    const contextId = getItem();
    const context = config?.contexts?.find((c) => c.id === contextId);
    setSelectedContext((state) => state ?? context ?? config?.contexts?.[0]);
  }, [config, getItem]);

  const changeContext = useCallback((id) => {
    const context = config?.contexts?.find((c) => c.id === id);
    setSelectedContext(context);
    setItem(context.id);
  }, [config, setItem]);

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
