import React, {
  createContext, useContext, useState, useCallback, useMemo,
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

export function YAMLConfigContextProvider({ children }) {
  const [selectedContext, setSelectedContext] = useState();

  const { status: configStatus, data: config, refetch: reloadConfig } = useQuery('config', () => axios('/api/config'), { refetchOnWindowFocus: false });

  const { setItem: setStoredContextId, getItem: getStoredContextId } = useLocalStorage(
    `${config?.technology?.id}.selectedContextId`,
  );

  const changeContext = useCallback((id) => {
    const context = config?.contexts?.find((c) => c.id === id);
    setSelectedContext(context);
    setStoredContextId(context.id);
  }, [config, setStoredContextId]);

  const currentContext = selectedContext
    ?? config?.contexts?.find((c) => c.id === getStoredContextId())
    ?? config?.contexts?.[0];

  const currentConnectionType = config?.connectionTypes
    ?.filter((c) => c.id === currentContext?.connectionTypeId)?.[0];

  return (
    <YAMLConfigContext.Provider value={useMemo(() => ({
      config,
      currentContext,
      currentConnectionType,
      changeContext,
      configStatus,
      reloadConfig,
    }), [config, currentContext, currentConnectionType, changeContext, configStatus, reloadConfig])}
    >
      {children}
    </YAMLConfigContext.Provider>
  );
}

YAMLConfigContextProvider.propTypes = propTypes;
YAMLConfigContextProvider.defaultProps = defaultProps;
