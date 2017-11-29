import * as React from 'react';
import { graphql, withApollo } from 'react-apollo';
import { UserCreate } from '../../graphql/user';
import Signup from './';

interface Props {
    createUser: Function;
}

export class SignupContainer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.onSignup = this.onSignup.bind(this);
    }

    /**
     * Sends data to server so user can be created
     */
    onSignup(target: HTMLFormElement) {

        const namesToSearchFor = ['email', 'password', 'confirmation', 'level', 'fullName', 'username'];

        // only doing types for props that are using here, in this function
        let values = {} as { fullName: string, level: number, password: string, confirmation: string };

        const inputs = target.querySelectorAll('input, select');

        for (const input of inputs as any as HTMLInputElement[]) {

           if (namesToSearchFor.indexOf(input.name) !== -1) {
               values[input.name] = input.value;
           }
        }

        if (values.password !== values.confirmation) {
            throw new Error('Password does not match confirmation');
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