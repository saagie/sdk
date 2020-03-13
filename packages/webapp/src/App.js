import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Page, PageLoader, PageContent, EmptyState } from 'saagie-ui/react';
import { AppTopbar } from './components/AppTopbar';
import { EndpointForm } from './components/EndpointForm';
import { JobForm } from './components/JobForm';
import { Actions } from './components/Actions';

function App() {
  const [status, setStatus] = useState('loading');
  const [config, setConfig] = useState();
  const [selectedContext, setSelectedContext] = useState();
  const [endpointForm, setEndpointForm] = useState({});

  const contextConfig = config?.contexts?.find(
    ({ label }) => label === selectedContext
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get('/api/config');
        setConfig(data);
        setSelectedContext(data?.contexts?.[0]?.label);
        setStatus('ready');
      } catch (error) {
        setStatus('error');
      }
    })();
  }, []);

  if (status === 'loading') {
    return (
      <Page>
        <PageLoader isLoading />
      </Page>
    );
  }

  if (status === 'error') {
    return (
      <Page size="sm">
        <PageContent>
          <EmptyState icon="fa-warning" content="Something wrong happened" />
        </PageContent>
      </Page>
    );
  }

  return (
    <Page size="xxl">
      <AppTopbar
        config={config}
        contextConfig={contextConfig}
        selectedContext={selectedContext}
        setSelectedContext={setSelectedContext}
      />
      <PageContent>
        <div className="sui-g-grid as--gutter-xxl">
          <div className="sui-g-grid__item as--2_7">
            <EndpointForm
              contextConfig={contextConfig}
              endpointForm={endpointForm}
              setEndpointForm={setEndpointForm}
            />
          </div>
          <div
            className="sui-g-grid__item as--2_7"
            key={JSON.stringify(endpointForm)}
          >
            <JobForm
              contextConfig={contextConfig}
              endpointForm={endpointForm}
            />
          </div>
          <div className="sui-g-grid__item as--3_7">
            <Actions contextConfig={contextConfig} />
          </div>
        </div>
      </PageContent>
    </Page>
  );
}

export default App;
