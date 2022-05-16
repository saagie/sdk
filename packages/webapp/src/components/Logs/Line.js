import React, { useRef } from 'react';
import { Icon, Tooltip } from 'saagie-ui/react';
import PropTypes from 'prop-types';

const propTypes = {
  index: PropTypes.number.isRequired,
  line: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
};

export function Line({ index, line, timestamp }) {
  const contentRef = useRef();

  return (
    <div className="sdk-a-logs__line">
      <Tooltip defaultPlacement="left" label={timestamp ? new Date(timestamp).toISOString() : 'Not available'}>
        <div className="sdk-a-logs__line-clock"><Icon name="fa-clock-o" /></div>
      </Tooltip>
      <div className="sdk-a-logs__line-index">{index + 1}</div>
      <div
        className="sdk-a-logs__line-content"
        ref={contentRef}
      >
        {line}
      </div>
    </div>
  );
}

Line.propTypes = propTypes;
