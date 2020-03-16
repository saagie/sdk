import React from 'react';
import PropTypes from 'prop-types';
import {
  PageTopbar,
  Thumbnail,
  FormHelper,
  FormControlSelect,
  Tooltip,
  Button,
} from 'saagie-ui/react';

const propTypes = {
  config: PropTypes.object,
  contextConfig: PropTypes.object,
  selectedContext: PropTypes.string,
  setSelectedContext: PropTypes.func,
};

const defaultProps = {
  config: {},
  contextConfig: {},
  selectedContext: '',
  setSelectedContext: () => {},
};

export const AppTopbar = ({
  config,
  contextConfig,
  selectedContext,
  setSelectedContext,
}) => (
  <PageTopbar
    title={(
      <div className="sui-m-media-object">
        <div className="sui-m-media-object__media">
          {config && (
            <Thumbnail
              size="xs"
              src={`/api/static?path=${config?.technology?.logo}`}
              alt={`Icon of ${config?.technology?.label}`}
            />
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
                hideDelayCustomTimeOut={6}
              >
                <i className="sui-a-icon as--fa-info-circle as--end" />
              </Tooltip>
            </strong>
          </label>
          {config?.contexts?.length > 0 && (
            <div className="sui-h-mb-none" style={{ minWidth: '15rem' }}>
              <FormControlSelect
                onChange={({ value }) => setSelectedContext(value)}
                menuPortalTarget={document.body}
                options={config?.contexts?.map(({ label }) => ({
                  value: label,
                  label,
                }))}
                value={{ value: selectedContext, label: selectedContext }}
              />
            </div>
          )}
        </div>
      </div>
    )}
  />
);

AppTopbar.propTypes = propTypes;
AppTopbar.defaultProps = defaultProps;
