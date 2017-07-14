import React from 'react';
import Form from './components/Form';
import {jwt} from './components/jwt';

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
                <Form
                    method="put"
                    action="userStatus"
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