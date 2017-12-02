import * as React from 'react';
import Container from '../../../components/Container';
import Input from '../../../components/Form/Input';
import Table from '../../../components/Table';
import { ModifiableUserInfo } from '../shared.interfaces';
import FormContainer from '../../../components/Form/container';
import { ChangeEvent } from 'react';

interface Props extends ModifiableUserInfo {
    onSubmit: Function;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onDelete: (e: ChangeEvent<HTMLInputElement>) => void;
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
              onChange={props.onChange}
              type="checkbox"
              defaultChecked={props.twoFactor}
            />
        ),
        (
            <input
                name="notifications"
                onChange={props.onChange}
                type="checkbox"
                defaultChecked={props.notifications}
            />
        ),
        (
            <input
                key="deletebox"
                type="checkbox"
                name="delAcc"
                value={props.id}
                onChange={props.onDelete}
            />
        )
    ];

    return (
        <Container
            heading="Options"
            className="tableContainer"
            children={
                <FormContainer onSubmit={props.onSubmit}>
                    <Table
                        key="table"
                        headings={headings}
                        rows={[row]}
                    />
                    <Input
                        key="password"
                        label="Password"
                        props={{
                            type: 'password',
                            name: 'password',
                            required: true
                        }}
                    />
                    <input type="submit" key="submit" />
                </FormContainer>}
        />
    );

}

export default ModifiableUserInfo;