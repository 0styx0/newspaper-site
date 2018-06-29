import * as React from 'react';
import { LoginFormContainer, Props } from './container';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import * as casual from 'casual';
import * as sinon from 'sinon';
import { encodeJwt } from '../../tests/jwt.helper';
import { mount, ReactWrapper } from 'enzyme';
import localStorageMock from '../../tests/localstorage.mock';
import { submitForm } from '../../tests/enzyme.helpers';

type Casual = typeof casual & { jwt: string, data: (jwt: string) => Promise<{ data: { login: { jwt: string }} }> };
const customCasual = casual as Casual;

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

function setup(loginUser: Function) {

    return mount(
        <MemoryRouter>
            <LoginFormContainer
                loginUser={loginUser ?
                    loginUser as Props['loginUser'] :
                    async (params: { variables: { username: string, password: string }}) =>
                      customCasual.data(customCasual.jwt)}
                history={[]}
            />
        </MemoryRouter>
    ) as ReactWrapper<Props, {}>;
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
        function setInputs(wrapper: ReactWrapper<Props, {}>) {

            const { username, password } = casual;

            (wrapper.find('input[name="username"]').instance() as {} as HTMLInputElement).value = username;
            (wrapper.find('input[name="password"]').instance() as {} as HTMLInputElement).value = password;

            return {
                username,
                password
            };
        }

        test('#onLogin gets called when form is submitted', () => {

            const spy = sinon.stub().returns(customCasual.data(customCasual.jwt));

            const wrapper = setup(async () => spy());

            setInputs(wrapper);
            submitForm(wrapper);

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
            localStorageMock.setItem = (field, value) => {

                expect(value).toEqual(jwt);

                return value; // to please typescript
            };
        });
    });
});
