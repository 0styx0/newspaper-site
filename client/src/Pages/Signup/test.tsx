import * as React from 'react';
import { SignupContainer } from './container';
import * as renderer from 'react-test-renderer';
// import { MemoryRouter } from 'react-router';
import casual from '../../tests/casual.data';
import setFakeJwt from '../../tests/jwt.helper';
import localStorageMock from '../../tests/localstorage.mock';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

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
        level: localStorageMock.getItem('jwt') ? casual.integer(1, 3).toString() : undefined
    };
});

type user = {
        password: string,
        email: string,
        confirmation: string,
        username: string,
        firstName: string,
        lastName: string,
        level: number | string | null
};

const customCasual: typeof casual & { formData: user } = casual;

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
                <SignupContainer />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('renders correctly (no choice of level) when someone creates an account without being signed in', () => {

            localStorageMock.removeItem('jwt');
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
        function populateForm(wrapper: any) {

            const formData = customCasual.formData;
            const searchFor = Object.keys(formData);
            const inputs = wrapper.find('input');
            const select = wrapper.find('select[name="level"]');

            inputs.nodes.concat(select.node || []).forEach((elt: any) => {

                if (searchFor.indexOf(elt.name) !== -1) {

                    elt.value = formData[elt.name];
                }

                else if (elt.name === 'fullName') {

                    const middleName = formData.middleName ? formData.middleName + ' ' : '';

                    elt.value = formData.firstName + ' ' + middleName + formData.lastName;
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

            wrapper.find('form').first().simulate('submit');
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

            localStorageMock.removeItem('jwt');
            testSubmitCorrectData();
        });
    });

});
