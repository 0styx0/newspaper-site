import React from 'react';
import {Container} from './components/Container';
import Form from './components/Form';
import {Input} from './components/Input';


function TwoFactor() {


 return <Container
          heading="Authenticate"
          children={
              <Form
                action="/api/userStatus"
                method="put"
                children={
                    <div>
                        <Input
                        label="Password"
                        props={{
                            autoFocus: true,
                            type: "password",
                            required: true,
                            name: "password"
                        }}
                        />
                        <Input
                        label="Auth Code"
                        abbr="Code that was emailed to you. If it has not been sent within a few moments, try logging in again"
                        props={{
                            type: "password",
                            required: true,
                            name: "authCode"
                        }}
                        />
                        <input type="submit" />
                    </div>
                }
              />
          }
        />
}

export default TwoFactor;