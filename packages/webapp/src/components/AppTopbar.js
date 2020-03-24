import React from 'react';
import {
  PageTopbar,
  FormHelper,
  FormControlSelect,
  Tooltip,
  Icon,
  Button,
} from 'saagie-ui/react';
import { useYAMLConfigContext } from '../contexts/YAMLConfigContext';
import { useFormContext } from '../contexts/FormContext';

const propTypes = {};
const defaultProps = {};

export const AppTopbar = () => {
  const {
    config, selectedContext, changeContext,
  } = useYAMLConfigContext();

  const { clearForm } = useFormContext();

  return (
    <PageTopbar
      title={(
        <div className="sui-m-media-object">
          <div className="sui-m-media-object__media">
            {config && (
              <Icon name={config?.technology?.logo || 'job'} />
            )}
          </div>
          <div className="sui-m-media-object__content">
            {config?.technology?.label}
            <FormHelper>{config?.technology?.description}</FormHelper>
          </div>
        </div>
      )}
      actions={(
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
          }}
        >
          <div className="sui-m-form-group as--horizontal">
            <label className="sui-a-form-label as--lg sui-h-mb-none">
              <strong>
                {config?.contexts?.length <= 0 ? (
                  <>No context available</>
                ) : (
                  <>Context</>
                )}
                <Tooltip
                  defaultPlacement="bottom"
                  label="Run 'npx @saagie/sdk init' to create a new context"
                  hideDelay
                  hideDelayCustomTimeOut={1}
                >
                  <i className="sui-a-icon as--fa-info-circle as--end" />
                </Tooltip>
              </strong>
            </label>
            {config?.contexts?.length > 0 && (
              <>
                <div className="sui-h-mb-none" style={{ minWidth: '10rem' }}>
                  <FormControlSelect
                    onChange={({ value }) => changeContext(value)}
                    menuPortalTarget={document.body}
                    options={config?.contexts?.map(({ id, label }) => ({
                      value: id,
                      label,
                    }))}
                    value={{ value: selectedContext?.id, label: selectedContext?.label }}
                  />
                </div>
                <div className="sui-h-mb-none">
                  <Button onClick={clearForm}>
                    Clear Forms
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    />
  );
};

AppTopbar.propTypes = propTypes;
AppTopbar.defaultProps = defaultProps;
