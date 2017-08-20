import * as React from 'react';
import ChangePassword from './';
import { UserUpdate } from '../../../graphql/user';
import { graphql, compose, withApollo } from 'react-apollo';

interface Props {
    updatePassword: Function;
}

class ChangePasswordContainer extends React.Component<Props, {}> {

    /**
     * Send data to server
     */
    onSubmit(e: Event) {

        e.preventDefault();
        e.stopPropagation();

        const target = e.target as HTMLFormElement;

        const formInfo =
          target.querySelectorAll(
              '[name=password], [name=newPassword], [name=newPasswordConfirmation]'
          ) as NodeListOf<HTMLInputElement>;

        if (formInfo[1].value !== formInfo[2].value) {
            return;
        }

        this.props.updatePassword({
            variables: {
                password: formInfo[0],
                newPassword: formInfo[2]
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