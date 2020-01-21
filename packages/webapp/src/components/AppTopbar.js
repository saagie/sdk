import React from 'react';
import PropTypes from 'prop-types';
import {
  PageTopbar, Thumbnail, FormHelper, FormControlSelect,
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
          <FormHelper>
            {config?.technology?.description}
          </FormHelper>
        </div>
      </div>
    )}
    actions={(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <div className="sui-m-form-group as--horizontal">
          <label className="sui-a-form-label as--lg sui-h-mb-none">
            <strong>
              Context
            </strong>
          </label>
          <div className="sui-h-mb-none" style={{ minWidth: '15rem' }}>
            <FormControlSelect
              onChange={({ value }) => setSelectedContext(value)}
              menuPortalTarget={document.body}
              options={config?.contexts?.map(({ label }) => ({ value: label, label }))}
              value={{ value: selectedContext, label: selectedContext }}
            />
          </div>
        </div>
        <FormHelper className="sui-h-text-right sui-h-mt-xs">
          {!!contextConfig?.mocksServer && `Mock available at ${window.location}mocks/${contextConfig?.label}`}
          {!contextConfig?.mocksServer && 'No mock server available'}
        </FormHelper>
      </div>
    )}
  />
);

AppTopbar.propTypes = propTypes;
AppTopbar.defaultProps = defaultProps;
