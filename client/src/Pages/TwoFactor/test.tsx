import * as React from 'react';
import { TwoFactorContainer } from './container';
import * as renderer from 'react-test-renderer';
import casual from '../../tests/casual.data';
import setFakeJwt from '../../tests/jwt.helper';
import { encodeJwt } from '../../tests/jwt.helper';
import localStorageMock from '../../tests/localstorage.mock';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

import { getJWT } from '../../components/jwt';


localStorageMock.clear();
const fakeVerifyEmail = async (params?: { variables: { authCode: string } }) => // params is only optional for testing
  ({data: { verifyEmail: encodeJwt({id: Math.random() }) } });

function setup(verifyEmail = fakeVerifyEmail) {

    return mount(
        <TwoFactorContainer
          history={[]}
          verifyEmail={verifyEmail}
        />
    );
}

describe('<TwoFactorContainer>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(
                <TwoFactorContainer history={[]} verifyEmail={() => true} />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    /**
     * Sets authCode
     *
     * @return authCode value and form
     */
    function populateForm(wrapper: any) {

        const authCode = casual.password;

        const form = wrapper.find('form').first();
        wrapper.find('input[name="authCode"]').node.value = authCode;

        return {
            authCode,
            form
        };
    }

    describe('#onSubmit', () => {

        const verifyEmailStub = sinon.stub().returns(Promise.resolve(
            {
                data: {
                    verifyEmail: {
                        jwt: encodeJwt({id: Math.random()})
                    }
                }
            }));

        describe('verifyEmail', () => {

            it('gets called when submit', () => {

                const wrapper = setup(verifyEmailStub);

                const { form } = populateForm(wrapper);
                form.simulate('submit');

                expect(verifyEmailStub).toBeTruthy();
            });

            it('gets called with correct props', () => {

                let expected: string;

                const wrapper = setup(async (params: { variables: { authCode: string } }) => {

                    expect(expected).toEqual(params.variables.authCode);

                    return {
                        data: {
                            verifyEmail: {
                                jwt: setFakeJwt({
                                    level: casual.integer(1, 3),
                                    id: Math.random(),
                                    profileLink: casual.word
                                })
                            }
                        }
                    };
                });

                const { form, authCode } = populateForm(wrapper);
                expected = authCode;
                form.simulate('submit');
            });
        });

        it('sets jwt when returned from verifyEmail', () => {

            const expected = encodeJwt({
                level: casual.integer(1, 3),
                id: casual.word,
                profileLink: casual.word
            });

            const wrapper = setup(async () => ({ data: { verifyEmail: { jwt: expected } } }));

            const { form } = populateForm(wrapper);

            localStorage.clear();
            form.simulate('submit');

            // seems to work as long as in setTimeout (onSubmit is async to can't just expect like normal)
            setTimeout(() => expect(localStorage.getItem('jwt')).toBe(expected), 1);
        });

        it('redirects to /publish if user was verified', () => {

            const wrapper = setup();
            const { form } = populateForm(wrapper);

            form.simulate('submit');

            // onSubmit is async, need setTimeout
            setTimeout(() => expect(wrapper.find(TwoFactorContainer).props().history).toEqual(['/publish']), 1);
        });
    });
});
