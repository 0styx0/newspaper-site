import * as React from 'react';
import { graphql, withApollo } from 'react-apollo';
import { UserCreate } from '../../graphql/user';
import Signup from './';

interface Props {
    createUser: Function;
}

class SignupContainer extends React.Component<Props, {}> {

    constructor() {
        super();

        this.onSignup = this.onSignup.bind(this);
    }

    /**
     * Sends data to server so user can be created
     */
    onSignup(e: Event) {

        e.preventDefault();

        const namesToSearchFor = ['email', 'password', 'confirmation', 'level', 'fullName', 'username'];
        let values = {} as { fullName: string, level: number }; // only doing types for props that are using

        const inputs = (e.target as HTMLFormElement).querySelectorAll('input, select');

        for (const input of inputs as any as HTMLInputElement[]) {

           if (namesToSearchFor.indexOf(input.name) !== -1) {
               values[input.name] = input.value;
           }
        }

        const name = values.fullName.split(' ');
        values = Object.assign(values, {
            firstName: name[0],
            middleName: name.length > 2 ? name[1] : null,
            lastName: name[name.length - 1],
            level: values.level
        });

        delete values.fullName;
        
        this.props.createUser({
            query: UserCreate,
            variables: values
        });
    }

    render() {
        return <Signup onSubmit={this.onSignup} />;
    }
}

const SignupContainerWithData = graphql(UserCreate, { name: 'createUser' })(SignupContainer as any);

export default withApollo(SignupContainerWithData);