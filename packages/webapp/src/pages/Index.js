import React from 'react';
import {
  Page, PageLoader, PageContent, EmptyState,
} from 'saagie-ui/react';
import { AppTopbar } from '../components/AppTopbar';
import { SmartForm } from '../components/SmartForm';
import { Actions } from '../components/Actions';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';

const propTypes = {};
const defaultProps = {};

export const Index = () => {
  const { status, selectedContext } = useYAMLConfigContext();
  const { formValues } = useFormContext();

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
      <PageContent key={selectedContext?.id}>
        <div className="sui-g-grid as--gutter-xxl">
          <div className="sui-g-grid__item as--2_7">
            <h3>Endpoint Form</h3>
            <SmartForm name="endpoint" />
          </div>
          <div
            className="sui-g-grid__item as--2_7"
            key={JSON.stringify(formValues.endpoint)}
          >
            <h3>Job Form</h3>
            <SmartForm name="job" />
          </div>
          <div className="sui-g-grid__item as--3_7">
            <h3>Instance Actions</h3>
            <Actions />
          </div>
        </div>
      </PageContent>
    </Page>
  );
};

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;
