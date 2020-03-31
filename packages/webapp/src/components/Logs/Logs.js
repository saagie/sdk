import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { VariableSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { EmptyState } from 'saagie-ui/react';
import { useWindowSize } from '../../hooks/useWindowSize';
import { LogsContext } from '../../contexts/LogsContext';
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
  const listRef = useRef();
  const sizeMap = useRef({});
  const setSize = useCallback((index, size) => {
    sizeMap.current = { ...sizeMap.current, [index]: size };
    listRef.current.resetAfterIndex(index);
  }, []);
  const getSize = useCallback((index) => sizeMap.current[index] || 20, []);
  const [windowWidth] = useWindowSize();

  if (!logs || logs.length <= 0) {
    return (
      <EmptyState icon="logs" content="No logs available" />
    );
  }

  return (
    <LogsContext.Provider value={{ setSize, windowWidth }}>
      <div className="sui-a-logs">
        <AutoSizer>
          {({ height, width }) =>
            (
              <List
                height={height}
                itemCount={logs.length}
                itemSize={getSize}
                width={width}
                ref={listRef}
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
    </LogsContext.Provider>
  );
};

Logs.propTypes = propTypes;
Logs.defaultProps = defaultProps;
