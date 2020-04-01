import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLogsContext } from '../../contexts/LogsContext';

const propTypes = {
  index: PropTypes.number.isRequired,
  line: PropTypes.shape({
    log: PropTypes.string.isRequired,
    stream: PropTypes.string,
    time: PropTypes.string,
  }).isRequired,
};

const STREAM = Object.freeze({
  STDOUT: 'stdout',
  STDERR: 'stderr',
});

export const Line = ({ index, line }) => {
  const contentRef = useRef();
  const { setSize, windowWidth } = useLogsContext();

  useEffect(() => {
    setSize(index, contentRef.current.getBoundingClientRect().height);
  }, [index, setSize, windowWidth]);


  return (
    <div className="sui-a-logs__line">
      <div className="sui-a-logs__line-index">{index + 1}</div>
      <div
        className={`sui-a-logs__line-content ${line.stream === STREAM.STDERR ? 'as--error' : ''}`}
        ref={contentRef}
      >
        {line.log}
      </div>
    </div>
  );
};

Line.propTypes = propTypes;
