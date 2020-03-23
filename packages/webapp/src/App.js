import React from 'react';
import { YAMLConfigContextProvider } from './contexts/YAMLConfigContext';
import { Index } from './pages/Index';

function App() {
  return (
    <YAMLConfigContextProvider>
      <Index />
    </YAMLConfigContextProvider>
  );
}

export default App;
