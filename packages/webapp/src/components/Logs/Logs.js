import React from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { EmptyState, Icon } from 'saagie-ui/react';
import { Line } from './Line';

const propTypes = {
  logs: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.shape({
      log: PropTypes.string.isRequired,
      timestamp: PropTypes.number,
    })),
    hasMore: PropTypes.string.isRequired,
    download: PropTypes.shape({
      href: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  }),
};

const defaultProps = {
  logs: {},
};

export function Logs({ logs }) {
  if (!logs || !logs.data || logs.data.length <= 0) {
    return (
      <EmptyState icon="logs" content="No logs available" />
    );
  }

  const ITEM_SIZE = 19;

  return (
    <>
      {logs.download
        && (
          <div className="sui-g-grid as--auto">
            <div className="sui-g-grid__item as--push">
              <a
                href={logs.download.href}
                download={logs.download.name}
                className="sui-a-button as--block as--primary"
              >
                <Icon name="fa-download" />
                &nbsp;Download full logs
              </a>
            </div>
          </div>
        )}
      <div className="sdk-a-logs">
        <AutoSizer>
          {({
            height,
            width,
          }) =>
            (
              <List
                height={height}
                itemCount={logs.data.length + (logs.hasMore ? 1 : 0)}
                itemSize={ITEM_SIZE}
                width={width}
              >
                {({
                  index,
                  style,
                }) => (
                  <div style={style}>
                    {index < logs.data.length
                      ? (
                        <Line
                          index={index}
                          line={logs.data[index].log}
                          timestamp={logs.data[index].timestamp}
                        />
                      )
                      : (
                        <Line
                          index={index}
                          line="...logs truncated. Get the full content by downloading the log file"
                        />
                      )}
                  </div>
                )}
              </List>
            )}
        </AutoSizer>
      </div>
    </>
  );
}

Logs.propTypes = propTypes;
Logs.defaultProps = defaultProps;
