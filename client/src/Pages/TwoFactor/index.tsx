import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import FormContainer from '../../components/Form/container';
import { FormEvent } from 'react';

interface Props {
    onSubmit: (target: HTMLFormElement, e: FormEvent<HTMLFormElement>) => void;
}

function TwoFactor(props: Props) {

    return (
        <Container heading="Authenticate">
            <FormContainer onSubmit={props.onSubmit}>
                <Input
                    key="authcode"
                    label="Auth Code"
                    abbr={`Code that was emailed to you. If it has not been sent
                     within a few moments, try logging in again`}
                    props={{
                        type: 'password',
                        required: true,
                        name: 'authCode'
                    }}
                />
                <input key="submit" type="submit" />
            </FormContainer>
        </Container>
    );
}

export default TwoFactor;