import * as React from 'react';
import { ChangePasswordContainer, Props } from './container';
import * as renderer from 'react-test-renderer';
import * as casual from 'casual';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';
import { submitForm } from '../../../tests/enzyme.helpers';

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

                <ChangePasswordContainer updatePassword={() => true} />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('submitting password', () => {

        let wrapper: ReactWrapper<Props, {}>;

        /**
         * Set value of inputs and submits the form
         */
        function setValues(oldPassword: string, newPassword: string, newPasswordConfirmation: string) {

            (wrapper.find('input[name="password"]').instance() as {} as HTMLInputElement)
                .value = oldPassword;
            (wrapper.find('input[name="newPassword"]').instance() as {} as HTMLInputElement)
                .value = newPassword;
            (wrapper.find('input[name="newPasswordConfirmation"]').instance() as {} as HTMLInputElement)
                .value = newPasswordConfirmation;

            submitForm(wrapper);
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

            setValues(values[0], values[1], values[2]);

            expect(spy.called).toBeFalsy();
        });
    });
});
