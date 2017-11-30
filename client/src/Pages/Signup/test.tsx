import * as React from 'react';
import { SignupContainer } from './container';
import * as renderer from 'react-test-renderer';
// import { MemoryRouter } from 'react-router';
import casual from '../../tests/casual.data';
import setFakeJwt from '../../tests/jwt.helper';
import * as mocks from '../../tests/setup.mocks';
import * as sinon from 'sinon';
import {  mount, ReactWrapper } from 'enzyme';

import { submitForm } from '../../tests/enzyme.helpers';



casual.define('formData', () => {

    const password = casual.password;

    return {
        password,
        email: casual.email,
        confirmation: password,
        username: casual.username,
        firstName: casual.first_name,
        middleName: (casual.coin_flip) ? casual.letter : null,
        lastName: casual.last_name,
        level: mocks.localStorage.getItem('jwt') ? casual.integer(1, 3).toString() : undefined
    };
});

type user = {
        password: string,
        email: string,
        confirmation: string,
        username: string,
        firstName: string,
        middleName: string,
        lastName: string,
        level: number | string | null
};

const customCasual = casual as typeof casual & { formData: user };

function setup(createUser: Function = () => true) {

    return mount(<SignupContainer createUser={createUser} />);
}

describe('<SignupContainer>', () => {

    describe('snapshots', () => {

        /**
         * Takes/tests snapshot
         */
        function snap() {

            const tree = renderer.create(
                <SignupContainer createUser={() => true} />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('renders correctly (no choice of level) when someone creates an account without being signed in', () => {

            mocks.localStorage.removeItem('jwt');
            snap();
        });

        it('gives choice of level when someone creates an account while being signed in', () => {

            setFakeJwt({level: 2, id: casual.word});
            snap();
        });
    });

    describe('createUser (graphql)', () => {

        /**
         * Fills out signup form using customCasual.formData
         */
        function populateForm(wrapper: ReactWrapper<any, any>) {

            const formData = customCasual.formData;
            const searchFor = Object.keys(formData);
            const inputs = wrapper.findWhere(elt => elt.is('input') || elt.is('select[name="level"]'));

            inputs.forEach(elt => {

                const instance: HTMLInputElement = elt.instance() as any;

                if (searchFor.indexOf(instance.name) !== -1) {
                    instance.value = formData[instance.name];
                }

                else if (instance.name === 'fullName') {

                    const middleName = formData.middleName ? formData.middleName + ' ' : '';

                    instance.value = formData.firstName + ' ' + middleName + formData.lastName;
                }
            });

            return {
                formData,
                form: wrapper.find('form').first()
            };
        }

        /**
         * For reuse when jwt level is different, or no jwt at all
         */
        function testSubmitCorrectData() {

            let actualData: Object;

            const wrapper = setup((params: {variables: user}) => {

                expect(params.variables).toEqual(actualData);
            });

            actualData = populateForm(wrapper).formData;

            submitForm(wrapper);
        }

        it('calls createUser when form is submitted', () => {

            const spy = sinon.spy();

            setFakeJwt({level: 3, id: casual.word});
            const wrapper = setup(spy);
            const { form } = populateForm(wrapper);

            form.simulate('submit');

            expect(spy.called).toBeTruthy();
        });

        it('submits correct data to createUser', () => {
            setFakeJwt({level: 3, id: casual.word});
            testSubmitCorrectData();
        });

        it(`submits proper data even when level isn't given`, () => {

            mocks.localStorage.removeItem('jwt');
            testSubmitCorrectData();
        });
    });

});
