import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';

interface Props {
    onSubmit: Function;
}

function TwoFactor(props: Props) {

    return (
        <Container heading="Authenticate">
            <form onSubmit={props.onSubmit as any}>
                <Input
                    label="Auth Code"
                    abbr={`Code that was emailed to you. If it has not been sent
                     within a few moments, try logging in again`}
                    props={{
                        type: 'password',
                        required: true,
                        name: 'authCode'
                    }}
                />
                <input type="submit" />
            </form>
        </Container>
    );
}

export default TwoFactor;