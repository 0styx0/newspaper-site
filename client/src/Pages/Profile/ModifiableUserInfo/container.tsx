import * as React from 'react';
import { PrivateUserQuery, UserUpdate } from '../../../graphql/user';
import { UserDelete } from '../../../graphql/users';
import { graphql, withApollo, compose } from 'react-apollo';
import { ModifiableUserInfo } from '../shared.interfaces';
import ModifiableUserInfoComponent from './';

interface Props {
    updateUser: Function;
    deleteUser: Function;
    privateUserData: {
        users: [ModifiableUserInfo] // always length = 1
    };
}

interface State {
    updates: {
        twoFactor?: boolean;
        notificationStatus?: boolean;
    };
    delete?: boolean;
}

/**
 * Container, has event listeners and passes data to @see ./index.tsx
 */
export class ModifiableUserInfoContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.onDelete = this.onDelete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            updates: {}
        };
    }

    onDelete(e: Event) {

        this.setState({
            delete: (e.target as HTMLInputElement).checked
        });
    }

    /**
     * Saves changes to state.updates
     *
     * @uses `e.target.name`, `e.target.value`
     */
    onChange(e: Event) {

        const target = e.target as HTMLInputElement;

        const updates = Object.assign({}, this.state.updates);

        updates[target.name] = target.checked;

        this.setState({
            updates
        });
    }

    /**
     * Sends `state.updates` to server
     */
    onSubmit(target: HTMLFormElement) {

        if (this.state.delete) {
            return this.deleteUser();
        }

        if (Object.keys(this.state.updates).length > 0) {
            this.props.updateUser({
                variables: Object.assign(this.state.updates, {
                    password: (target.querySelector('[name=password]') as HTMLInputElement).value
                })
            });
        }
    }

    /**
     * Sends id of user to server so user can be deleted
     */
    deleteUser() {

        this.props.deleteUser({
            variables: {
                ids: [this.props.privateUserData.users[0].id]
            }
        });
    }

    render() {

        if (!this.props.privateUserData || !this.props.privateUserData.users) {
           return null;
        }

        return (
            <ModifiableUserInfoComponent
              onSubmit={this.onSubmit}
              onChange={this.onChange}
              onDelete={this.onDelete}
              {...this.props.privateUserData.users[0]}
            />
        );
    }
}

const ModifiableUserInfoContainerWithData = compose(
    graphql(PrivateUserQuery, {
        name: 'privateUserData',
        options: {
            variables: {
                profileLink: 'meiselesd2018'
            }
        }
    }),
    graphql(UserUpdate, {name: 'updateUser'}),
    graphql(UserDelete, {name: 'deleteUser'})
)(ModifiableUserInfoContainer as any);

export default withApollo(ModifiableUserInfoContainerWithData);
