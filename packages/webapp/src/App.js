import React from 'react';
import { YAMLConfigContextProvider } from './contexts/YAMLConfigContext';
import { Index } from './pages/Index';
import { FormContextProvider } from './contexts/FormContext';
import { SidePanel } from './components/SidePanel';
import { ErrorContextProvider } from './contexts/ErrorContext';
import './scss/index.scss';

function App() {
  return (
    <YAMLConfigContextProvider>
      <FormContextProvider>
        <ErrorContextProvider>
          <SidePanel />
          <Index />
        </ErrorContextProvider>
      </FormContextProvider>
    </YAMLConfigContextProvider>
  );
}

export default App;
