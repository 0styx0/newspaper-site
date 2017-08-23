import * as React from 'react';
import { ChangePasswordContainer } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import * as casual from 'casual';
import * as sinon from 'sinon';

function setup(mockGraphql: {updatePassword?: Function} = {}) {

    return mount(
        <ChangePasswordContainer
            updatePassword={mockGraphql.updatePassword ? mockGraphql.updatePassword : () => true}
        />
    );
}

describe('<ChangePasswordContainer>', () => {

    describe('snapshots', () => {

         it ('should render correctly', () => {

            const tree = renderer.create(

                <ChangePasswordContainer />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('submitting password', () => {

        let wrapper: any;

        /**
         * Set value of inputs and submits the form
         */
        function setValues(oldPassword: string, newPassword: string, newPasswordConfirmation: string) {

            wrapper.find('input[name="password"]').node.value = oldPassword;
            wrapper.find('input[name="newPassword"]').node.value = newPassword;
            wrapper.find('input[name="newPasswordConfirmation"]').node.value = newPasswordConfirmation;

            wrapper.find('form').first().simulate('submit');
        }

        it('submits all data needed if valid', () => {

            const newPassword = casual.string;
            const oldPassword = casual.string;

            wrapper = setup({updatePassword: (data: {variables: { newPassword: string, password: string}}) => {

                expect(data.variables.newPassword).toBe(newPassword);
                expect(data.variables.password).toBe(oldPassword);
            }});

            setValues(oldPassword, newPassword, newPassword);
        });

        it('is not submitted if passwords do not match', () => {

            const spy = sinon.spy();

            wrapper = setup({updatePassword: spy});

            setValues(casual.string, casual.string, casual.string);

            expect(spy.called).toBeFalsy();
        });

        it('is not submitted if an input is empty', () => {

            const newPassword = casual.string;
            const oldPassword = casual.string;

            const spy = sinon.spy();

            wrapper = setup({updatePassword: spy});

            const values = [oldPassword, newPassword, newPassword];

            values[casual.integer(0, 2)] = '';

            setValues(...values);

            expect(spy.called).toBeFalsy();
        });
    });
});