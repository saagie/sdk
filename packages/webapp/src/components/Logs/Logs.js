import React from 'react';
import PropTypes from 'prop-types';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { EmptyState } from 'saagie-ui/react';
import { Line } from './Line';

const propTypes = {
  logs: PropTypes.arrayOf(PropTypes.shape({
    log: PropTypes.string.isRequired,
    stream: PropTypes.string.isRequired,
    time: PropTypes.string,
  })),
};

const defaultProps = {
  logs: [],
};

export const Logs = ({ logs }) => {
  if (!logs || logs.length <= 0) {
    return (
      <EmptyState icon="logs" content="No logs available" />
    );
  }

  const ITEM_SIZE = 19;

  return (
    <div className="sdk-a-logs">
      <AutoSizer>
        {({ height, width }) =>
          (
            <List
              height={height}
              itemCount={logs.length}
              itemSize={ITEM_SIZE}
              width={width}
            >
              {({ index, style }) => (
                <div style={style}>
                  <Line index={index} line={logs[index]} />
                </div>
              )}
            </List>
          )}
      </AutoSizer>
    </div>
  );
};

Logs.propTypes = propTypes;
Logs.defaultProps = defaultProps;
