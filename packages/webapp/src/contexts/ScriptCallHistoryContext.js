import React, {
  createContext, useCallback, useContext, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { useMutation, useQuery } from 'react-query';
import axios from 'axios';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {
  children: '',
};

export const ScriptCallHistoryContext = createContext();
export const useScriptCallHistoryContext = () => useContext(ScriptCallHistoryContext);

export const useScriptCallMutation = (folderPath, scriptCall, params, opts, onSuccess, onError) => {
  const { addScriptCall } = useScriptCallHistoryContext();

  const scriptFullPath = folderPath ? `${folderPath}/${scriptCall?.script}` : scriptCall?.script;
  const postData = {
    script: scriptFullPath,
    function: scriptCall?.function,
    opts,
    params,
  };

  const addScriptCallResponse = (response) => {
    addScriptCall({
      ...postData,
      date: new Date(),
      data: response?.data,
      error: response?.error,
      logs: response?.logs,
    });
  };

  return useMutation({
    mutationFn: () => axios.post('/api/action', postData),
    onSuccess: (res) => {
      addScriptCallResponse(res);
      if (onSuccess) {
        onSuccess(res);
      }
    },
    onError: (err) => {
      addScriptCallResponse(err?.response?.data);
      if (onError) {
        onError(err);
      }
    },
  });
};

export const useScriptCall = (
  queryKey, folderPath, scriptCall, params, enabled, onSuccess, onError,
) => {
  const { addScriptCall } = useScriptCallHistoryContext();

  const addScriptCallResponse = useCallback((postData, response) => {
    addScriptCall({
      ...postData,
      date: new Date(),
      status: response?.status,
      message: response?.message,
      data: response?.data,
      error: response?.error,
      logs: response?.logs,
    });
  }, [addScriptCall]);

  const postData = {
    script: `${folderPath}/${scriptCall?.script}`,
    function: scriptCall?.function,
    params,
  };

  return useQuery(queryKey, () => axios.post('/api/action', postData), {
    enabled: enabled && !!scriptCall,
    onSuccess: (res) => {
      addScriptCallResponse(postData, res);
      if (onSuccess) {
        onSuccess(res);
      }
    },
    onError: (err) => {
      addScriptCallResponse(postData, err?.response?.data);
      if (onError) {
        onError(err);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export function ScriptCallHistoryContextProvider({ children }) {
  const [history, setHistory] = useState([]);

  const context = useMemo(() => ({
    history,
    addScriptCall: (scriptCall) => {
      setHistory((prev) => [...prev, { ...scriptCall, id: uuid() }]);
    },
    clearHistory: () => {
      setHistory([]);
    },
  }), [history, setHistory]);

  return (
    <ScriptCallHistoryContext.Provider value={context}>
      {children}
    </ScriptCallHistoryContext.Provider>
  );
}

ScriptCallHistoryContextProvider.propTypes = propTypes;
ScriptCallHistoryContextProvider.defaultProps = defaultProps;
