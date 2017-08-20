import * as React from 'react';
import Container from '../../../components/Container';
import Input from '../../../components/Form/Input';

interface Props {
    onSubmit: (e: Event) => void;
}

function ChangePassword(props: Props) {

    return (
        <Container
            heading="Change Password"
            children={
                <form onSubmit={props.onSubmit}>
                    <Input
                        label="New Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'newPasswordConfirmation',
                            type: 'password',
                            required: true
                        }}

                    />
                    <Input
                        label="Confirm Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'newPassword',
                            type: 'password',
                            required: true
                        }}
                    />
                    <Input
                        label="Old Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'password',
                            type: 'password',
                            required: true
                        }}
                    />
                    <input type="submit" value="Change Password" />
                </form>
            }
        />
    );
}

export default ChangePassword;