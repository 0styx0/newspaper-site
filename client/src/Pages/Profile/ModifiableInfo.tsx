import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import Table from '../../components/Table';
import CheckboxContainer from '../../components/Form/Checkbox/container';
import { UserUpdate } from '../../graphql/user';
import { UserDelete } from '../../graphql/users';
import { graphql, withApollo } from 'react-apollo';

interface Props {
    email: string;
    twoFactor: boolean;
    notificationStatus: boolean;
    id: string;
    userUpdate: Function;
    userDelete: Function;
}

interface State {
    updates: {
        twoFactor?: boolean;
        notificationStatus?: boolean;
    };
    delete?: boolean;
}

class ModifiableUserInfo extends React.Component<Props, State> {

    constructor() {
        super();

        this.state = {
            updates: {}
        };
    }

    onChange(e: Event) {

        const target = e.target as HTMLInputElement;

        const updates = Object.assign({}, this.state.updates);

        updates[target.name] = target.value;

        this.setState({
            updates
        });
    }

    onSubmit() {

        if (this.state.delete) {
            return this.deleteUser();
        }

        if (this.state.updates) {
            this.props.updateUser({
                variables: [...this.state.updates]
            });
        }
    }

    deleteUser() {

        this.props.deleteUser({
            variables: {
                ids: [this.props.id]
            }
        });
    }

    render() {

        const headings = [
            'Email',
            '2FA',
            'Notifications',
            <span key="deleteAcc" className="danger">Delete Account</span>
        ];

        const row = [
            this.props.email,
            (
                <CheckboxContainer
                    props={{
                        name: 'twoFactor',
                        onChange: this.onChange,
                        defaultChecked: this.props.twoFactor
                    }}
                />
            ),
            (
                <CheckboxContainer
                    props={{
                        name: 'notificationStatus',
                        onChange: this.onChange,
                        defaultChecked: this.props.notificationStatus
                    }}
                />
            ),
            (
                <input
                  key="deletebox"
                  type="checkbox"
                  name="delAcc"
                  value={this.props.id}
                  onChange={() => this.setState({
                      delete: !this.state.delete
                  })}
                />
            )
        ];

        return (
            <Container
                heading="Options"
                className="tableContainer"
                children={
                    <form onSubmit={this.onSubmit}>
                        <Table
                            headings={headings}
                            rows={[row]}
                        />
                        <Input
                            label="Password"
                            props={{
                                type: 'password',
                                name: 'password',
                                required: true
                            }}
                        />
                        <input type="submit" />
                    </form>}
            />
        );

    }

}

const ModifiableUserInfoWithData = compose(
    graphql(UserUpdate),
    graphql(UserDelete)
)(ModifiableUserInfo);

export default withApollo(ModifiableUserInfoWithData);
