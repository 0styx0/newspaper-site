import * as React from 'react';
import { graphql, withApollo } from 'react-apollo';
import { RecoverPassword } from '../../graphql/user';
import ForgotPassword from './';

interface Props {
    recoverPassword:
      (params: {
          query: typeof RecoverPassword,
          variables: { username: string, authCode: string, email: string }
        }
      ) => Promise<{message: string}>;
}

export class ForgotPasswordContainer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);

    }

    /**
     * Sends data to server
     */
    onSubmit(target: HTMLFormElement) {

        this.props.recoverPassword({
            query: RecoverPassword,
            variables: {
                authCode: (target.querySelector('input[name=lastAuth]') as HTMLInputElement).value,
                username: (target.querySelector('input[name=username]') as HTMLInputElement).value,
                email: (target.querySelector('input[name=email]') as HTMLInputElement).value,
            }
        });
    }

    render() {
        return <ForgotPassword onSubmit={this.onSubmit} />;
    }
}

const ForgotPasswordContainerWithData =
    graphql(RecoverPassword, {name: 'recoverPassword'})(ForgotPasswordContainer as any);

export default withApollo(ForgotPasswordContainerWithData);
