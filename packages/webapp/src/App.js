import React from 'react';
import { YAMLConfigContextProvider } from './contexts/YAMLConfigContext';
import { Index } from './pages/Index';
import { FormContextProvider } from './contexts/FormContext';
import './scss/index.scss';

function App() {
  return (
    <YAMLConfigContextProvider>
      <FormContextProvider>
        <Index />
      </FormContextProvider>
    </YAMLConfigContextProvider>
  );
}

export default App;
