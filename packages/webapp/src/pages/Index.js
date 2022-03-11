import React from 'react';
import { useQuery } from 'react-query';
import {
  Page, PageLoader, PageContent, EmptyState, PageFooter, FormFeedback, Button, InfoText, Message,
} from 'saagie-ui/react';
import axios from 'axios';
import { AppTopbar } from '../components/AppTopbar';
import { SmartForm } from '../components/SmartForm';
import { Actions } from '../components/Actions';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';

const propTypes = {};
const defaultProps = {};

const isConnectionTypeReady = (parameters, formValues) => {
  if (!parameters || !formValues) {
    return false;
  }
  const mandatoryFields = parameters.filter((param) => param.mandatory);
  for (let i = 0; i < mandatoryFields.length; i += 1) {
    const value = formValues[mandatoryFields[i].id];
    if (!value) {
      return false;
    }
  }
  return true;
};

export function Index() {
  const {
    configStatus, currentContext, currentConnectionType,
  } = useYAMLConfigContext();
  const { formValues, clearForm } = useFormContext();
  const { infoStatus, data: info } = useQuery('info', () => axios('/api/info'), { refetchOnWindowFocus: false });

  if (configStatus === 'loading') {
    return (
      <Page>
        <PageLoader isLoading />
      </Page>
    );
  }

  if (configStatus === 'error') {
    return (
      <Page size="sm">
        <PageContent>
          <EmptyState icon="fa-warning" content="Something wrong happened" />
        </PageContent>
      </Page>
    );
  }

  const connectionTypeReady = isConnectionTypeReady(
    currentConnectionType?.parameters,
    formValues?.connection,
  );
  const jobFormReady = isConnectionTypeReady(
    currentContext?.parameters,
    formValues?.parameters,
  );

  return (
    <Page size="xxl">
      <AppTopbar />
      <PageContent key={currentContext?.id}>
        <div className="sui-g-grid as--gutter-xxl">
          <div className="sui-g-grid__item as--2_7">
            <h3>
              <div className="sui-g-grid as--no-wrap">
                <span className="sui-g-grid__item">
                  Connection Form
                  { connectionTypeReady
                    ? <InfoText color="success">Form validated</InfoText>
                    : <InfoText color="danger">The form is missing required information</InfoText>}
                </span>
                <Button className="sui-g-grid__item as--push as--middle" onClick={() => clearForm('connection')}>Clear</Button>
              </div>
            </h3>
            {currentConnectionType
              ? <SmartForm name="connection" parameters={currentConnectionType?.parameters} />
              : <Message color="danger">Error: connection type &apos;{currentContext?.connectionTypeId}&apos; not found</Message>}
          </div>
          <div className="sui-g-grid__item as--2_7">
            <h3>
              <div className="sui-g-grid as--no-wrap">
                <span className="sui-g-grid__item">
                  Job Form
                  { jobFormReady
                    ? <FormFeedback color="success">Form validated</FormFeedback>
                    : <FormFeedback color="danger">The form is missing required information</FormFeedback>}
                </span>
                <Button className="sui-g-grid__item as--push as--middle" onClick={() => clearForm('parameters')}>Clear</Button>
              </div>
            </h3>
            <SmartForm name="parameters" parameters={currentContext?.parameters} dependencyReady={connectionTypeReady} />
          </div>
          <div className="sui-g-grid__item as--3_7">
            <Actions ready={connectionTypeReady && jobFormReady} />
          </div>
        </div>
      </PageContent>
      <PageFooter>
        <small>
          You are running this SDK UI in <code>{process.env.NODE_ENV}</code> using build <code>{process.env.REACT_APP_GIT_SHA}</code> with <code>@saagie/sdk@{infoStatus === 'loading' || infoStatus === 'error' ? '...' : info?.version}</code> CLI
        </small>
      </PageFooter>
    </Page>
  );
}

Index.propTypes = propTypes;
Index.defaultProps = defaultProps;
