import * as React from 'react';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import Container from '../../components/Container';
import { setJWT } from '../../components/jwt';
import { Link } from 'react-router-dom';

import './index.css';

interface Props {
    history: string[];
}

class LoginForm extends React.Component<Props, {}> {

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

    async setJWT(method: string, json: Promise<{level: number}>, result: {statusText: string}) {

        const jwt = await setJWT(null as any); // TODO:

        if (jwt.level) {

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
                    <FormContainer action="/api/userStatus" method="put" onSubmit={this.setJWT} children={this.renderInputs()} />
                        }
            />
        );
    }
}


export default LoginForm;