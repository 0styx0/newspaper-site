import React from 'react';
import PropTypes from 'prop-types';

import './index.css';



function Numberline(props) {

    return <span id="issueRange">{props.lineContent}</span>
}

Numberline.propTypes = {
    lineContent: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.element])).isRequired
}

export default Numberline;