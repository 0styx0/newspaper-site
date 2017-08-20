import * as React from 'react';
import { Link } from 'react-router-dom';

interface Props {
    fullName: string;
    profileLink: string;
}

/**
 * Link to user
 */
export default function UserLink(props: Props) {

    return (
        <Link
            to={`/u/${props.profileLink}`}
        >
            {props.fullName}
        </Link>
    );
}