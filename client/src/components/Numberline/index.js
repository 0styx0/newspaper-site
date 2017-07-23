import React from 'react';

import './index.css';



function Numberline(props) {

    return <span id="issueRange">{props.lineContent}</span>
}

Numberline.propTypes = {
    lineContent: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default Numberline;