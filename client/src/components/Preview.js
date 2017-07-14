import React from 'react';
import { Link } from 'react-router-dom';

function Preview(props) {

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



export default Preview;