import * as React from 'react';
import { ForgotPasswordContainer, Props } from './container';
import * as renderer from 'react-test-renderer';
import * as sinon from 'sinon';
import casual from '../../tests/casual.data';
import { mount, ReactWrapper } from 'enzyme';
import { setupComponent, submitForm } from '../../tests/enzyme.helpers';

type formValues = {authCode: string, email: string, username: string};

const mockRecoverPassword = (params:
                            { query: Function,
                              variables: formValues
                            }
                        ) => Promise.resolve({message: ''});

function setup(recoverPassword: typeof mockRecoverPassword = mockRecoverPassword) {

    return mount(
        <ForgotPasswordContainer
            recoverPassword={async (params) => recoverPassword(params)}
        />
    );
}

describe('<ForgotPasswordContainer>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(
                <ForgotPasswordContainer
                    recoverPassword={mockRecoverPassword}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('recoverPassword (graphql mutation)', () => {

        /**
         * Sets values of inputs
         *
         * @return new values of the inputs + ForgotPasswordContainer as component
         */
        function setValues(wrapper: ReactWrapper<Props, {}>): formValues & {component: ForgotPasswordContainer} {

            const { username, email, password } = casual;

            const component = setupComponent(wrapper, ForgotPasswordContainer);

            (wrapper.find('input[name="lastAuth"]').instance() as {} as HTMLInputElement).value = password;
            (wrapper.find('input[name="username"]').instance() as {} as HTMLInputElement).value = username;
            (wrapper.find('input[name="email"]').instance() as {} as HTMLInputElement).value = email;

            return {
                component,
                username,
                email,
                authCode: password
            };
        }

        it('gets called when form is submitted', () => {

            const spy = sinon.spy();
            const wrapper = setup(spy);

            const values = setValues(wrapper);

            values.component.onSubmit = spy;

            submitForm(wrapper);

            expect(spy.called).toBeTruthy();
        });

        it('gets correct data', () => {

            let values: formValues & { component: ForgotPasswordContainer };

            const wrapper = setup(
                async (params:
                    { query: Function, variables: formValues}) => {

                    const expected = {
                        authCode: values.authCode,
                        email: values.email,
                        username: values.username
                    };

                    expect(expected).toEqual(params.variables);

                    return { message: '' };
                }
            );

            values = setValues(wrapper);

            submitForm(wrapper);
        });
    });
});
