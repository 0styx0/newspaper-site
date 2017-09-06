import * as React from 'react';
import { setJWT } from '../../helpers/jwt';
import { graphql, withApollo } from 'react-apollo';
import { UserVerifyEmail } from '../../graphql/user';
import TwoFactor from './';

interface Props {
    history: string[];
    verifyEmail: (params: { query: typeof UserVerifyEmail, variables: { authCode: string }}) =>
      Promise<{
          data: {
              verifyEmail: {
                  jwt: string
                }
            }
        }>;
}

export class TwoFactorContainer extends React.Component<Props, {}> {

    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);
    }

    async onSubmit(e: Event) {

        const target = e.target as HTMLFormElement;

        const { data } = await this.props.verifyEmail({
            query: UserVerifyEmail,
            variables: {
                authCode: (target.querySelector('input[name=authCode]') as HTMLInputElement).value
            }
        });

        if (data.verifyEmail.jwt) {
            setJWT(data.verifyEmail.jwt);
            this.props.history.push('/publish');
        }
    }

    render() {
        return <TwoFactor onSubmit={this.onSubmit} />;
    }
}

const TwoFactorContainerWithData = graphql(UserVerifyEmail, { name: 'verifyEmail' })(TwoFactorContainer as any);

export default withApollo(TwoFactorContainerWithData);
