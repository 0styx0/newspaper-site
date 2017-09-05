import * as React from 'react';
import Input from '../../components/Form/Input';
import Container from '../../components/Container';
import { Link } from 'react-router-dom';
import FormContainer from '../../components/Form/container';

import './index.css';

interface Props {
    onLogin: Function;
}

function LoginForm(props: Props) {

    return (
        <Container heading="Login">
          <FormContainer onSubmit={props.onLogin as any} >
            <Input
                key="username"
                label="Username"
                props={{
                    name: 'username',
                    type: 'text',
                    placeholder: 'Username',
                    required: true
                }}
            />

            <Input
                key="password"
                label="Password"
                props={{
                    name: 'password',
                    type: 'password',
                    placeholder: 'Password',
                    required: true
                }}
            />

            <input key="submit" type="submit" className="submit" value="Log In" />
            <br key="br"/>

            <Link key="link" to="forgotPass">Forgot your password?</Link>
          </FormContainer>
        </Container>
    );
}


export default LoginForm;