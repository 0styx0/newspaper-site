import * as React from 'react';
import Container from '../../../components/Container';
import Input from '../../../components/Form/Input';
import Table from '../../../components/Table';
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
            <input
              name="twoFactor"
              onChange={props.onChange as any}
              type="checkbox"
              defaultChecked={props.twoFactor}
            />
        ),
        (
            <input
                name="notificationStatus"
                type="checkbox"
                defaultChecked={props.notificationStatus}
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