import * as React from 'react';
import { setJWT, getJWT } from '../../helpers/jwt';
import LoginForm from './';
import { UserLogin } from '../../graphql/user';
import { graphql, withApollo } from 'react-apollo';
import graphqlErrorNotifier from '../../helpers/graphqlErrorNotifier';

import './index.css';

interface Props {
    history: string[];
    loginUser: ( params:
    {
        variables: {
            username: string,
            password: string
        }
    } ) => Promise<{ data: { login: { jwt: string } }, errors?: {message: string}[] }>;
}

export class LoginFormContainer extends React.Component<Props, {}> {

    constructor() {
        super();

        this.setJWT = this.setJWT.bind(this);
    }

    /**
     * Gets jwt from server and saves to localStorage if valid login info is in form given
     *
     * @param e - even from form with [name=username], [name=password]
     */
    async setJWT(target: HTMLFormElement) {

        const username = (target.querySelector('[name=username]') as HTMLInputElement).value;
        const password = (target.querySelector('[name=password]') as HTMLInputElement).value;

        const { data } = await graphqlErrorNotifier(this.props.loginUser, {
            variables: {
                username,
                password
            }
        });

        setJWT(data.login.jwt);
        const jwt = getJWT();

        if (jwt.level) {

            this.props.history.push('/publish');
        }
        else if (jwt.id) {

            this.props.history.push('/authLogin');
        }
    }

    render() {

        return (
            <LoginForm onLogin={this.setJWT} />
        );
    }
}

const LoginFormContainerWithData = graphql(UserLogin, { name: 'loginUser' })(LoginFormContainer as any);

export default withApollo(LoginFormContainerWithData);
