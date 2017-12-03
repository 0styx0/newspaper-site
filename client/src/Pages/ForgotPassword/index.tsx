import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import FormContainer from '../../components/Form/container';
import { Helmet } from 'react-helmet';

interface Props {
    onSubmit: Function;
}

function ForgotPassword(props: Props) {

    return (
        <Container heading="Recover Password">

            <Helmet>
                <title>Recover Password</title>
                <meta
                    name="description"
                    content="Recover forgotten password"
                />
            </Helmet>

            <FormContainer onSubmit={props.onSubmit}>
                <Input
                    key="username"
                    label="Username"
                    props={{
                        required: true,
                        name: 'username',
                        type: 'text'
                    }}
                />
                <Input
                    key="email"
                    label="Email"
                    props={{
                        type: 'email',
                        name: 'email',
                        required: true
                    }}
                />
                <Input
                    key="authcode"
                    label="Last Auth Code"
                    props={{
                        type: 'password',
                        name: 'lastAuth',
                        required: true
                    }}
                />

                <input key="submit" type="submit" />
            </FormContainer>
        </Container>
    );
}

export default ForgotPassword;