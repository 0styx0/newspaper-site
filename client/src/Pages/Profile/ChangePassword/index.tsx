import * as React from 'react';
import Container from '../../../components/Container';
import Input from '../../../components/Form/Input';
import FormContainer from '../../../components/Form/container';

interface Props {
    onSubmit: (e: Event) => void;
}

function ChangePassword(props: Props) {

    return (
        <Container
            heading="Change Password"
            children={
                <FormContainer onSubmit={props.onSubmit as any}>
                    <Input
                        key="new"
                        label="New Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'newPasswordConfirmation',
                            type: 'password',
                            required: true
                        }}
                    />
                    <Input
                        key="confirm"
                        label="Confirm Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'newPassword',
                            type: 'password',
                            required: true
                        }}
                    />
                    <Input
                        key="old"
                        label="Old Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'password',
                            type: 'password',
                            required: true
                        }}
                    />
                    <input key="submit" type="submit" value="Change Password" />
                </FormContainer>}
        />
    );
}

export default ChangePassword;