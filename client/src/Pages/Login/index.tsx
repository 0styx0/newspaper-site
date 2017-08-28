import * as React from 'react';
import Input from '../../components/Form/Input';
import Container from '../../components/Container';
import { Link } from 'react-router-dom';

import './index.css';

interface Props {
    onLogin: Function;
}

function LoginForm(props: Props) {

    return (
        <Container heading="Login">
          <form onSubmit={props.onLogin as any} >
            <Input
                label="Username"
                props={{
                    name: 'username',
                    type: 'text',
                    placeholder: 'Username',
                    required: true
                }}
            />

            <Input
                label="Password"
                props={{
                    name: 'password',
                    type: 'password',
                    placeholder: 'Password',
                    required: true
                }}
            />

            <input type="submit" className="submit" value="Log In" />
            <br />

            <Link to="forgotPass">Forgot your password?</Link>
          </form>
        </Container>
    );
}


export default LoginForm;