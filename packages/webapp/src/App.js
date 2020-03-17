import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Page, PageLoader, PageContent, EmptyState,
} from 'saagie-ui/react';
import { AppTopbar } from './components/AppTopbar';
import { SmartForm } from './components/SmartForm';
import { Actions } from './components/Actions';

function App() {
  const [status, setStatus] = useState('loading');
  const [config, setConfig] = useState();
  const [selectedContext, setSelectedContext] = useState();
  const [formValues, setFormValues] = useState({});

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

  const updateForm = (form) => ({ name, value }) => {
    setFormValues((state) => ({
      ...state,
      [form]: {
        ...state[form],
        [name]: value,
      },
    }));
  };

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
            <SmartForm
              contextConfig={contextConfig} // -> context
              name="endpoint"
              formValues={formValues}
              updateForm={updateForm}
            />
          </div>
          <div
            className="sui-g-grid__item as--2_7"
            key={JSON.stringify(formValues.endpoint)}
          >
            <SmartForm
              contextConfig={contextConfig} // -> context
              name="job"
              formValues={formValues}
              updateForm={updateForm}
            />
          </div>
          <div className="sui-g-grid__item as--3_7">
            <Actions
              contextConfig={contextConfig} // -> context
              formValues={formValues}
            />
          </div>
        </div>
      </PageContent>
    </Page>
  );
}

export default App;
