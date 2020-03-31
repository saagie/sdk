import { createContext, useContext } from 'react';

export const LogsContext = createContext({});
export const useLogsContext = () => useContext(LogsContext);
