import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';

interface Props {
    onSubmit: Function;
}

function ForgotPassword(props: Props) {

    return (
        <Container heading="Recover Password">
            <form onSubmit={props.onSubmit as any}>
                <Input
                    label="Username"
                    props={{
                        required: true,
                        name: 'username',
                        type: 'text'
                    }}
                />
                <Input
                    label="Email"
                    props={{
                        type: 'email',
                        name: 'email',
                        required: true
                    }}
                />
                <Input
                    label="Last Auth Code"
                    props={{
                        type: 'password',
                        name: 'lastAuth',
                        required: true
                    }}
                />

                <input type="submit" />
            </form>
        </Container>
    );
}

export default ForgotPassword;