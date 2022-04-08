import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { YAMLConfigContextProvider } from './contexts/YAMLConfigContext';
import { Index } from './pages/Index';
import { FormContextProvider } from './contexts/FormContext';
import { SidePanel } from './components/SidePanel';
import './scss/index.scss';
import { ScriptCallHistoryContextProvider } from './contexts/ScriptCallHistoryContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <YAMLConfigContextProvider>
        <FormContextProvider>
          <ScriptCallHistoryContextProvider>
            <SidePanel />
            <Index />
          </ScriptCallHistoryContextProvider>
        </FormContextProvider>
      </YAMLConfigContextProvider>
    </QueryClientProvider>
  );
}

export default App;
