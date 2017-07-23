import React from 'react';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import Select from '../../components/Form/Select';
import Container from '../../components/Container';
import {jwt} from '../../components/jwt';

import './index.css';

class Signup extends React.Component {

    renderLevelSelect() {

        if (jwt.level > 1) {
          // adding .changed since might not want user to be more than lvl 1, and for the input, can't change it since hidden
          return (

            <Select
              label="Level"
              props={{
                className: "changed",
                defaultValue: 1,
                name: "lvl",
                children: Array(jwt.level).fill(null).map((val, idx) => <option key={idx} value={idx + 1}>{idx + 1}</option>),
                required: true
              }}
            />
          );
        }
        else {

            return (<input type="hidden" className="changed" name="lvl" value="1" />)
        }
    }

    renderInputs() {

        return (
            <div>
                <Input
                  label="Username"
                  abbr="Must not contain spaces"
                  props={{
                    name: "username",
                    type: "text",
                    pattern: "[\\w._-]+",
                    title: "Must be letters, numbers, ., _, or -",
                    placeholder: "jpulitzer",
                    required: true
                  }}
                />

                <Input
                  label="Full Name"
                  abbr="Must contain only uppercase, lowercase, or periods and must be at least 2 words (middle name should be left as a 1 letter initial)"
                  props={{
                    name: "fullName",
                    type: "text",
                    pattern: "^[a-zA-Z.-]+\\s[a-zA-Z-]+(\\s[a-zA-Z]+)?$",
                    title: "First, middle initial (optional), last",
                    placeholder: "Edgar A Poe",
                    required: true
                  }}
                />

                <Input
                  label="Password"
                  abbr="Password must contain at least: 1 uppercase, 1 lowercase, 1 number, 6 character"
                  props={{
                    name: "password",
                    type: "password",
                    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$",
                    required: true
                  }}
                />

                <Input
                  label="Confirm Password"
                  abbr="Must be the same as the password"
                  props={{
                    name: "confirmation",
                    type: "password",
                    required: true
                  }}
                />

                <Input
                  label="Email"
                  abbr="Must be your assigned email."
                  props={{
                    name: "email",
                    type: "email",
                    pattern: "^[^@]+@\\w+\\.\\w+$",
                    required: true
                  }}
                />

                {this.renderLevelSelect()}


                <input type="submit" className="submit" name="create" value="Sign Up" />
            </div>
        );
    }

    render() {

        return (
            <Container
              heading="Sign Up"
              children={
                  <FormContainer action="/api/user" method="post" children={this.renderInputs()} />}
            />
        );
    }
}

export default Signup;