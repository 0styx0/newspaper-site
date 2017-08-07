import * as React from 'react';
import Container from '../../components/Container';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import {setJWT} from '../../components/jwt';

interface Props {
    history: string[]
}

class TwoFactor extends React.Component<Props, {}> {


    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit() {

        setJWT()
        .then(() => this.props.history.push('/publish'));
    }

    render() {

        return <Container
                heading="Authenticate"
                children={
                    <FormContainer
                        action="/api/userStatus"
                        method="put"
                        onSubmit={this.onSubmit}
                        children={
                            <div>
                                <Input
                                label="Password"
                                props={{
                                    autoFocus: true,
                                    type: "password",
                                    required: true,
                                    name: "password"
                                }}
                                />
                                <Input
                                label="Auth Code"
                                abbr="Code that was emailed to you. If it has not been sent within a few moments, try logging in again"
                                props={{
                                    type: "password",
                                    required: true,
                                    name: "authCode"
                                }}
                                />
                                <input type="submit" />
                            </div>
                        }
                    />
                }
                />
    }
}

export default TwoFactor;