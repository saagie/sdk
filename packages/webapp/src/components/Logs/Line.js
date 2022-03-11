import React, { useRef } from 'react';
import { Icon, Tooltip } from 'saagie-ui/react';
import PropTypes from 'prop-types';

const propTypes = {
  index: PropTypes.number.isRequired,
  line: PropTypes.string.isRequired,
};

export function Line({ index, line }) {
  const contentRef = useRef();

  return (
    <div className="sdk-a-logs__line">
      <Tooltip defaultPlacement="left">
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
