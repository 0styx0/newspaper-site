import * as React from 'react';
import { ForgotPasswordContainer } from './container';
import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import * as sinon from 'sinon';

import casual from '../../tests/casual.data';

type formValues = {authCode: string, email: string, username: string};

const mockRecoverPassword = (params:
                            { query: Function,
                              variables: formValues
                            }
                        ) => Promise.resolve({message: ''});

function setup(recoverPassword: typeof mockRecoverPassword = mockRecoverPassword) {

    return mount(
        <ForgotPasswordContainer
            recoverPassword={recoverPassword}
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
        function setValues(wrapper: any): formValues & {component: any} {

            const { username, email, password } = casual;

            const component = wrapper.find(ForgotPasswordContainer);

            wrapper.find('input[name="lastAuth"]').node.value = password;
            wrapper.find('input[name="username"]').node.value = username;
            wrapper.find('input[name="email"]').node.value = email;

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

            values.component.node.onSubmit = spy;

            values.component.find('form').first().simulate('submit');

            expect(spy.called).toBeTruthy();
        });

        it('gets correct data', () => {

            let values: formValues & { component: any };

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
            values.component.find('form').first().simulate('submit');
        });
    });
});
