import * as React from 'react';
import Input from '../../components/Form/Input';
import Select from '../../components/Form/Select';
import Container from '../../components/Container';
import { getJWT } from '../../helpers/jwt';
import FormContainer from '../../components/Form/container';

import './index.css';

interface Props {
  onSubmit: Function;
}

function Signup(props: Props) {

    const jwt = getJWT();

    return (
        <Container heading="Sign Up">
          <FormContainer onSubmit={props.onSubmit}>

            <Input
              key="username"
              label="Username"
              abbr="Must not contain spaces"
              props={{
                name: 'username',
                type: 'text',
                pattern: '[\\w._-]+',
                title: 'Must be letters, numbers, ., _, or -',
                placeholder: 'jpulitzer',
                required: true
              }}
            />

            <Input
              label="Full Name"
              key="fullname"
              abbr={`Must contain only uppercase, lowercase, or
                periods and must be at least 2 words (middle name should be left as a 1 letter initial)`}
              props={{
                name: 'fullName',
                type: 'text',
                pattern: '^[a-zA-Z.-]+\\s[a-zA-Z-]+(\\s[a-zA-Z]+)?$',
                title: 'First, middle initial (optional), last',
                placeholder: 'Edgar A Poe',
                required: true
              }}
            />

            <Input
              label="Password"
              key="password"
              abbr="Password must contain at least: 1 uppercase, 1 lowercase, 1 number, 6 character"
              props={{
                name: 'password',
                type: 'password',
                pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                required: true
              }}
            />

            <Input
              label="Confirm Password"
              key="confirmation"
              abbr="Must be the same as the password"
              props={{
                name: 'confirmation',
                type: 'password',
                required: true
              }}
            />

            <Input
              label="Email"
              key="email"
              abbr="Must be your assigned email."
              props={{
                name: 'email',
                type: 'email',
                pattern: '^[^@]+@\\w+\\.\\w+$',
                required: true
              }}
            />

            {jwt.level > 1 ?
              (
                <Select
                    label="Level"
                    key="level"
                    props={{
                      className: 'changed',
                      defaultValue: 1 as {} as string,
                      name: 'level',
                      children:
                        Array(jwt.level).fill(null).map((val, idx) =>
                          <option key={idx} value={idx + 1}>{idx + 1}</option>),
                      required: true
                    }}
                />
                )
                : <span key="nothing" />
            }

            <input key="submit" type="submit" className="submit" name="create" value="Sign Up" />

          </FormContainer>
        </Container>
    );
}

export default Signup;