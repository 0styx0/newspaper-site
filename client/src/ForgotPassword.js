import React from 'react';
import {Container} from './components/Container';
import Form from './components/Form';
import {Input} from './components/Input';


function ForgotPassword() {

    return (
        <Container
          heading="Recover Password"
          children={

              <Form
                  action="/api/user"
                  method="put"
                  children={
                      <div>
                          <Input
                              label="Username"
                              props={{
                                  required: true,
                                  name: "user",
                                  type: "text"
                              }}
                          />
                          <Input
                              label="Email"
                              props={{
                                  type: "email",
                                  name: "email",
                                  required: true
                              }}
                          />
                          <Input
                              label="Last Auth Code"
                              props={{
                                  type: "password",
                                  name: "lastAuth",
                                  required: true
                              }}
                          />

                          <input type="submit" />
                      </div>

                  }
              />
          }
        />
    )
}

export default ForgotPassword;