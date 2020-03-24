import { useCallback } from 'react';

export const useLocalStorage = (key) => {
  const getLocalStorageKey = useCallback(() => (key && !key.includes('undefined') ? key : ''), [key]);

  const setItem = useCallback((item) => {
    window.localStorage.setItem(
      getLocalStorageKey(),
      JSON.stringify(item),
    );
  }, [getLocalStorageKey]);

  const getItem = useCallback(() => JSON.parse(
    window.localStorage.getItem(getLocalStorageKey()),
  ), [getLocalStorageKey]);

  const removeItem = useCallback(() => {
    window.localStorage.removeItem(getLocalStorageKey());
  }, [getLocalStorageKey]);

  return {
    getLocalStorageKey, setItem, getItem, removeItem,
  };
};
