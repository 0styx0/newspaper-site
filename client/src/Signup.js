import React from 'react';
import Form from './components/Form';
import {Input, Select} from './components/Input';
import {Container, jwt} from './components/Container';

class Signup extends React.Component {

    renderLevelSelect() {

        if (jwt.level > 1) {

          return (

            <Select
              label="Level"
              name="lvl"
              children={Array(jwt.level).fill(null).map((val, idx) => <option key={idx} value={idx + 1}>{idx + 1}</option>)}
              required
            />
          );
        }
    }

    renderInputs() {

        return (
            <div>
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  pattern="[\w._-]+"
                  title="Must be letters, numbers, ., _, or -"
                  placeholder="jpulitzer"
                  abbr="Must not contain spaces"
                  required
                />

                <Input
                  label="Full Name"
                  name="fullName"
                  type="text"
                  pattern="^[a-zA-Z.-]+\s[a-zA-Z-]+(\s[a-zA-Z]+)?$"
                  title="First, middle initial (optional), last"
                  placeholder="Edgar A Poe"
                  abbr="Must contain only uppercase, lowercase, or periods and must be at least 2 words (middle name should be left as a 1 letter initial)"
                  required
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*).{6,}$"
                  abbr="Password must contain at least: 1 uppercase, 1 lowercase, 1 number, 6 character"
                  required
                />

                <Input
                  label="Confirm Password"
                  name="confirmation"
                  type="password"
                  abbr="Must be the same as the password"
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  pattern="^[^@]+@tabc\.org$"
                  placeholder="example@tabc.org"
                  abbr="Must be your TABC email."
                  required
                />

                {this.renderLevelSelect()}

                <input type="hidden" name="lvl" value="1" />

                <input type="submit" className="submit" name="create" value="Sign Up" />
            </div>
        );
    }

    render() {

        return (
            <Container
              heading="Sign Up"
              children={
                  <Form action="../api/user" children={this.renderInputs()} />}
            />
        );
    }
}

export default Signup;