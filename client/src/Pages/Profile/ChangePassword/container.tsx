import * as React from 'react';
import ChangePassword from './';
import { UserUpdate } from '../../../graphql/user';
import { graphql, compose, withApollo } from 'react-apollo';

interface Props {
    updatePassword: Function;
}

export class ChangePasswordContainer extends React.Component<Props, {}> {

    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);
    }

    /**
     * Send data to server
     */
    onSubmit(e: Event) {

        const target = e.target as HTMLFormElement;

        const oldPassword = target.querySelector('[name=password]') as HTMLInputElement;
        const newPassword = target.querySelector('[name=newPassword]') as HTMLInputElement;
        const newPasswordConfirmation = target.querySelector('[name=newPasswordConfirmation]') as HTMLInputElement;

        if (newPassword.value !== newPasswordConfirmation.value ||
          !(oldPassword.value && newPassword.value && newPasswordConfirmation.value)) {

            return;
        }

        this.props.updatePassword({
            variables: {
                password: oldPassword.value,
                newPassword: newPassword.value
            }
        });
    }

    render() {
        return <ChangePassword onSubmit={this.onSubmit} />;
    }
}

const ChangePasswordContainerWithData = compose(
    graphql(UserUpdate, {name: 'updatePassword'}) as any
)(ChangePasswordContainer);

export default withApollo(ChangePasswordContainerWithData);