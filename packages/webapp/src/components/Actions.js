import React from 'react';
import PropTypes from 'prop-types';
import { PageEmptyState, Button } from 'saagie-ui/react';
import { Status } from 'saagie-ui/react/projects';
import { UnControlled as CodeMirror } from 'react-codemirror2';

const propTypes = {
  contextConfig: PropTypes.object,
};

const defaultProps = {
  contextConfig: {},
};

function useQuery() {
  return new URLSearchParams(window.location.search);
}

export const Actions = ({
  contextConfig,
}) => {
  const query = useQuery();

  const isDebugMode = query.get('debug') !== null;

  return (
    <>
      <h3>Instance Actions</h3>
      {
        isDebugMode ? (
          <PageEmptyState title="Debug">
            <pre className="sui-h-text-left">
              {JSON.stringify(contextConfig, null, 2)}
            </pre>
          </PageEmptyState>
        ) : (
          <>
            <div className="sui-g-grid as--start as--middle">
              <div className="sui-g-grid__item as--1_6">
                <Button color="action-play">Run</Button>
              </div>
              <div className="sui-g-grid__item as--1_6">
                <Button color="action-stop">Stop</Button>
              </div>
              <div className="sui-g-grid__item as--1_6">
                <Status name="running" size="xl" />
              </div>
              <div className="sui-g-grid__item as--1_1">
                <CodeMirror
                  value="<h1>I ♥ react-codemirror2</h1>"
                  options={{
                    lineNumbers: true,
                    readOnly: true,
                  }}
                />
              </div>
            </div>
          </>
        )
      }
    </>
  );
};

Actions.propTypes = propTypes;
Actions.defaultProps = defaultProps;
