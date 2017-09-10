import * as React from 'react';
import { Link } from 'react-router-dom';

interface Props {
    url: string;
    issue: number | string;
}

/**
 * Link to article whose info is given in props
 */
export default function ArticleLink(props: Props) {

    return (
        <Link
            to={`/issue/${props.issue}/story/${encodeURIComponent(props.url)}`}
        >
            {decodeURIComponent(props.url)}
        </Link>
    );
}