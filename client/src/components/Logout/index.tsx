import * as React from 'react';

import { Link } from 'react-router-dom';

function Logout() {

    return (
        <Link to="/">
            <button type="button" onClick={() => window.localStorage.removeItem('jwt')}>Logout</button>
        </Link>
    );
}

export default Logout;