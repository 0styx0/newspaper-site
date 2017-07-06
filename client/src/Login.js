import React from 'react';
import Form from './components/Form';
import {Input} from './components/Input';
import {Container} from './components/Container';
import {jwt} from './components/jwt';

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

    setJWT() {

        fetch('http://localhost:3000/api/userStatus', {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
        }).then(data => data)
        .then(data => data.json())
        .then(json => {
            jwt.level = +json.level
            jwt.email = json.email
            jwt.id = json.id
        })
    }

    render() {

        return (
            <Container heading="Login"
                children={
                    <Form action="api/userStatus" method="put" onSubmit={this.setJWT} children={this.renderInputs()} />
                        }
            />
        );
    }
}


export default LoginForm;