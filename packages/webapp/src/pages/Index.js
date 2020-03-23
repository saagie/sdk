import React, { useState } from 'react';
import {
  Page, PageLoader, PageContent, EmptyState,
} from 'saagie-ui/react';
import { AppTopbar } from '../components/AppTopbar';
import { SmartForm } from '../components/SmartForm';
import { Actions } from '../components/Actions';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';

const propTypes = {
};

const defaultProps = {
};

export const Index = () => {
  const [formValues, setFormValues] = useState({});
  const { status } = useYAMLConfigContext();

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
      <AppTopbar />
      <PageContent>
        <div className="sui-g-grid as--gutter-xxl">
          <div className="sui-g-grid__item as--2_7">
            <h3>Endpoint Form</h3>
            <SmartForm
              name="endpoint"
              formValues={formValues}
              updateForm={updateForm}
            />
          </div>
          <div
            className="sui-g-grid__item as--2_7"
            key={JSON.stringify(formValues.endpoint)}
          >
            <h3>Job Form</h3>
            <SmartForm
              name="job"
              formValues={formValues}
              updateForm={updateForm}
            />
          </div>
          <div className="sui-g-grid__item as--3_7">
            <h3>Instance Actions</h3>
            <Actions formValues={formValues} />
          </div>
        </div>
      </PageContent>
    </Page>
  );
};

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;
