import React from 'react';
import Form from './components/Form';
import {Input} from './components/Input';
import {Container} from './components/Container';
import {jwt, setJWT} from './components/jwt';
import fetchFromApi from './helpers/fetchFromApi';
import { Link } from 'react-router-dom';

class LoginForm extends React.Component {

    constructor() {
        super();

        this.setJWT = this.setJWT.bind(this);
    }

    renderInputs() {

        return (
            <div>
                <Input
                  label="Username"
                  props={{
                      name: "username",
                      type: "text",
                      placeholder: "Username",
                      required: true
                  }}
                />

                <Input
                  label="Password"
                  props={{
                      name: "password",
                      type: "password",
                      placeholder: "Password",
                      required: true
                  }}
                />

                <input type="submit" className="submit" value="Log In" />
                <br />

                <Link to="forgotPass">Forgot your password?</Link>
            </div>
        )

    }

    async setJWT(method, json, result) {

        if (await (setJWT()).level) {

            this.props.history.push('/publish');
        }
        else if (result.statusText === "Email Sent") {

            this.props.history.push('/authLogin');
        }
    }

    render() {

        return (
            <Container heading="Login"
                children={
                    <Form action="/api/userStatus" method="put" onSubmit={this.setJWT} children={this.renderInputs()} />
                        }
            />
        );
    }
}


export default LoginForm;