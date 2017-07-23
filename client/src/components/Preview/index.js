import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './index.css';

export default function Preview(props) {

    return (
        <div className="preview">
            <div className="content" dangerouslySetInnerHTML={{__html: props.lede}} />

            <Link
              className="small"
              to={`/issue/${props.issue}/story/${props.url}`}
            >
              Read More
            </Link>
            <span className="small"> ({props.views} views)</span>
        </div>
    )
}

Preview.propTypes = {
    lede: PropTypes.string.isRequired,
    views: PropTypes.number.isRequired,
    issue: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired
}