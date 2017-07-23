import React from 'react';
import FormContainer from '../Form/container';
import {jwt} from '../jwt';

import { Redirect } from 'react-router'


class Logout extends React.Component {

    constructor() {
        super();

        this.onLogout = this.onLogout.bind(this);

        this.state = {
            redirect: false
        }
    }

    onLogout() {

        jwt.level = 0;

        this.setState({
            redirect: true
        })
    }

    render() {

        return (
            <span>
                <FormContainer
                    method="put"
                    action="/api/userStatus"
                    onSubmit={this.onLogout}
                    children={<input
                                className="changed"
                                id="logoutInpt"
                                type="submit"
                                name="logout"
                                value="Log Out"
                               />}
                />
                {this.state.redirect ? <Redirect to="/" /> : ""}
            </span>
        )
    }
}

export default Logout;