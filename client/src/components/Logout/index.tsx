import * as React from 'react';
import { Link } from 'react-router-dom';

interface Props {
    onLogout: Function;
}

function Logout(props: Props) {

    return (
        <Link to="/">
            <button type="button" onClick={() => props.onLogout()}>Logout</button>
        </Link>
    );
}

export default Logout;