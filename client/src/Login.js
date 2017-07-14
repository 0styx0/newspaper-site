import React from 'react';
import Form from './components/Form';
import {Input} from './components/Input';
import {Container} from './components/Container';
import {jwt} from './components/jwt';
import A from './components/A';
import fetchFromApi from './helpers/fetchFromApi';

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

                <A href="forgotPass" text="Forgot your password?" router={this} />
            </div>
        )

    }

    setJWT() {

        fetchFromApi('userStatus')
         .then(data => data)
         .then(data => data.json())
         .then(json => {
            jwt.level = +json.level
            jwt.email = json.email
            jwt.id = json.id

            if (jwt.level) {

                this.props.history.push('/publish');
            }
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