import * as React from 'react';
import { Link } from 'react-router-dom';

import './index.css';

interface Props {
    lede: string;
    views: number;
    issue: number;
    url: string;
}

export default function Preview(props: Props) {

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
