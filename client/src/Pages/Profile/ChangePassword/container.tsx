import * as React from 'react';
import ChangePassword from './';
import { UserUpdate } from '../../../graphql/user';
import { graphql, compose, withApollo } from 'react-apollo';
import graphqlErrorNotifier from '../../../helpers/graphqlErrorNotifier';

export interface Props {
    updatePassword: Function;
}

export class ChangePasswordContainer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
    }

    /**
     * Send data to server
     */
    onSubmit(target: HTMLFormElement) {

        const oldPassword = target.querySelector('[name=password]') as HTMLInputElement;
        const newPassword = target.querySelector('[name=newPassword]') as HTMLInputElement;
        const newPasswordConfirmation = target.querySelector('[name=newPasswordConfirmation]') as HTMLInputElement;

        if (newPassword.value !== newPasswordConfirmation.value ||
          !(oldPassword.value && newPassword.value && newPasswordConfirmation.value)) {

            return;
        }

        graphqlErrorNotifier(
            this.props.updatePassword,
            {
                variables: {
                    password: oldPassword.value,
                    newPassword: newPassword.value
                }
            },
            'passwordUpdated'
        );
    }

    render() {
        return <ChangePassword onSubmit={this.onSubmit} />;
    }
}

const ChangePasswordContainerWithData = compose(
    graphql(UserUpdate, {name: 'updatePassword'})
)(ChangePasswordContainer);

export default withApollo(ChangePasswordContainerWithData);