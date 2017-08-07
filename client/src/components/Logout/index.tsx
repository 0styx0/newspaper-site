import * as React from 'react';
import FormContainer from '../Form/container';
import {jwt} from '../jwt';

import { Link } from 'react-router-dom'

function Logout() {

    return (
        <Link to="/" onClick={() => jwt.level = 0}>
            <FormContainer
                method="put"
                action="/api/userStatus"
                children={<input
                            className="changed"
                            id="logoutInpt"
                            type="submit"
                            name="logout"
                            value="Log Out"
                            />}
            />
        </Link>
    )
}

export default Logout;