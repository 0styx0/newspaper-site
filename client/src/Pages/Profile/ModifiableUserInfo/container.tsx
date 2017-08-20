import * as React from 'react';
import { PrivateUserQuery, UserUpdate } from '../../../graphql/user';
import { UserDelete } from '../../../graphql/users';
import { graphql, withApollo, compose } from 'react-apollo';
import { ModifiableUserInfo } from '../shared.interfaces';
import ModifiableUserInfoComponent from './';

interface Props extends ModifiableUserInfo {
    updateUser: Function;
    deleteUser: Function;
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
class ModifiableUserInfoContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.onDelete = this.onDelete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);

        this.state = {
            updates: {}
        };
    }

    onDelete() {

        this.setState({
            delete: !this.state.delete
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

        updates[target.name] = target.value;

        this.setState({
            updates
        });
    }

    /**
     * Sends `state.updates` to server
     */
    onSubmit() {

        if (this.state.delete) {
            return this.deleteUser();
        }

        if (this.state.updates) {
            this.props.updateUser({
                variables: this.state.updates
            });
        }
    }

    /**
     * Sends id of user to server so user can be deleted
     */
    deleteUser() {

        this.props.deleteUser({
            variables: {
                ids: [this.props.id]
            }
        });
    }

    render() {

        return (
            <ModifiableUserInfoComponent
              onSubmit={this.onSubmit}
              onChange={this.onChange}
              onDelete={this.onDelete}
              {...this.props}
            />
        );
    }
}

const ModifiableUserInfoContainerWithData = compose(
    (graphql(PrivateUserQuery) as any,
    graphql(UserUpdate, {name: 'updateUser'}) as any,
    graphql(UserDelete, {name: 'deleteUser'}) as any) as any
)(ModifiableUserInfoContainer);

export default withApollo(ModifiableUserInfoContainerWithData);