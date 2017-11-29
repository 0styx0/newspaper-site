import * as React from 'react';
import { LoginFormContainer } from './container';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import * as casual from 'casual';
import * as sinon from 'sinon';
import { encodeJwt } from '../../tests/jwt.helper';
import * as mocks from '../../tests/setup.mocks';
import { mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';



// using it here even though appears do to nothing to get rid of unused import warning.
// Using it really for side effect of defining localstorage
mocks.localStorage.clear();


casual.define('jwt', () =>

    encodeJwt({
        profileLink: customCasual.username,
        level: customCasual.integer(1, 3),
        id: customCasual.word
    })
);

casual.define('data', (jwt: string) => Promise.resolve({
    data: {
        login: {
            jwt
        }
    }
}));

type Casual = typeof casual & { jwt: string, data: (jwt: string) => Promise<{ data: { login: { jwt: string }} }> };
const customCasual = casual as Casual;

function setup(loginUser: any) {

    return mount(
        <MemoryRouter>
            <LoginFormContainer
                loginUser={loginUser ?
                    loginUser :
                    (params: { variables: { username: string, password: string }}) =>
                      customCasual.data(customCasual.jwt)}
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
                        loginUser={(params: { variables: { username: string, password: string }}) =>
                          customCasual.data(customCasual.jwt)}
                        history={[]}
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
        function setInputs(wrapper: any) {

            const { username, password } = casual;

            wrapper.find('input[name="username"]').instance().value = username;
            wrapper.find('input[name="password"]').instance().value = password;

            return {
                username,
                password
            };
        }

        test('#onLogin gets called when form is submitted', () => {

            const spy = sinon.stub().returns(customCasual.data(customCasual.jwt));

            const wrapper = setup(spy);

            setInputs(wrapper);
            wrapper.find('form').first().simulate('submit');

            expect(spy.called).toBeTruthy();
        });

        it('submits correct data', async () => {

            let expected = {};
            const jwt = customCasual.jwt;

            const wrapper = setup(
                async (data: { variables: {username: string, password: string} }) => {
                    expect(data.variables).toEqual(expected);
                    return customCasual.data(jwt);
                }
            );

            expected = setInputs(wrapper);

            wrapper.find('form').first().simulate('submit');

            // checks if jwt was written to localstorage
            mocks.localStorage.setItem = (field, value) => {

                expect(value).toEqual(jwt);

                return value; // to please typescript
            };
        });
    });
});
