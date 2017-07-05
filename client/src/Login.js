import React from 'react';
import Form from './components/Form';
import {Input} from './components/Input';
import {Container} from './components/Container';

class LoginForm extends React.Component {

    renderInputs() {

        return (
            <div>
                <Input label="Username" name="username" type="text" placeholder="Username" required />

                <Input label="Password" name="password" type="password" placeholder="Password" required />

                <input type="submit" className="submit" value="Log In" />
                <br />

                <a href="forgotPass">Forgot your password?</a>
            </div>
        )

    }

    render() {

        return (
            <Container heading="Login"
                children={
                    <Form action="../api/userStatus" children={this.renderInputs()} />
                        }
            />
        );
    }
}


export default LoginForm;