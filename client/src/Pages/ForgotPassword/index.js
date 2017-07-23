import React from 'react';
import Container from '../../components/Container';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';


function ForgotPassword() {

    return (
        <Container
          heading="Recover Password"
          children={

              <FormContainer
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