import * as React from 'react';
import Container from '../../../components/Container';
import Input from '../../../components/Form/Input';
import Table from '../../../components/Table';
import CheckboxContainer from '../../../components/Form/Checkbox/container';
import { ModifiableUserInfo } from '../shared.interfaces';

interface Props extends ModifiableUserInfo {
    onSubmit: Function;
    onChange: Function;
    onDelete: Function;
}

function ModifiableUserInfo(props: Props) {

    const headings = [
        'Email',
        '2FA',
        'Notifications',
        <span key="deleteAcc" className="danger">Delete Account</span>
    ];

    const row = [
        props.email,
        (
            <CheckboxContainer
                props={{
                    name: 'twoFactor',
                    onChange: props.onChange,
                    defaultChecked: props.twoFactor
                }}
            />
        ),
        (
            <CheckboxContainer
                props={{
                    name: 'notificationStatus',
                    defaultChecked: props.notificationStatus
                }}
            />
        ),
        (
            <input
                key="deletebox"
                type="checkbox"
                name="delAcc"
                value={props.id}
                onChange={props.onDelete as any}
            />
        )
    ];

    return (
        <Container
            heading="Options"
            className="tableContainer"
            children={
                <form onSubmit={props.onSubmit as any}>
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

export default ModifiableUserInfo;