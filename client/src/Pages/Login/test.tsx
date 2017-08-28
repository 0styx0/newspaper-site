import * as React from 'react';
import { LoginFormContainer } from './container';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';
import * as casual from 'casual';
import * as sinon from 'sinon';
import { encodeJwt } from '../../tests/jwt.helper';
import localStorageMock from '../../tests/localstorage.mock';

import { getJWT } from '../../components/jwt';

// using it here even though appears do to nothing to get rid of unused import warning.
// Using it really for side effect of defining localstorage
localStorageMock.clear();

casual.define('jwt', () =>

    encodeJwt({
        profileLink: casual.username,
        level: casual.integer(1, 3),
        id: casual.word
    })
);

casual.define('data', (jwt: string) => Promise.resolve({
    data: {
        login: {
            jwt
        }
    }
}));

function setup(loginUser: Function) {

    return mount(
        <MemoryRouter>
            <LoginFormContainer
                loginUser={loginUser ?
                    loginUser :
                    (params: { variables: { username: string, password: string }}) => casual.data(casual.jwt)}
                history={[]}
            />
        </MemoryRouter>
    );
}

describe('<LoginFormContainer>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(

                <MemoryRouter>
                    <LoginFormContainer
                        loginUser={(params: { variables: { username: string, password: string }}) => true}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('#onLogin', () => {

        /**
         * Sets username and password inputs and submits the form
         */
        function setInputs(wrapper) {

            const { username, password } = casual;

            wrapper.find('input[name="username"]').node.value = username;
            wrapper.find('input[name="password"]').node.value = password;

            return {
                username,
                password
            };
        }

        test('#onLogin gets called when form is submitted', () => {

            const spy = sinon.stub().returns(casual.data(casual.jwt));

            const wrapper = setup(spy);

            setInputs(wrapper);
            wrapper.find('form').first().simulate('submit');

            expect(spy.called).toBeTruthy();
        });

        it('submits correct data', async () => {

            let expected = {};
            const jwt = casual.jwt;

            const wrapper = setup(
                async (data: { variables: {username: string, password: string} }) => {
                    expect(data.variables).toEqual(expected);
                    return casual.data(jwt);
                }
            );

            expected = setInputs(wrapper);

            wrapper.find('form').first().simulate('submit');

            // checks if jwt was written to localstorage
            localStorageMock.setItem = (field, value) => {

                expect(value).toEqual(jwt);

                return value; // to please typescript
            };
        });
    });
});
