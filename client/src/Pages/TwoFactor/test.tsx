import * as React from 'react';
import { TwoFactorContainer, Props } from './container';
import * as renderer from 'react-test-renderer';
import casual from '../../tests/casual.data';
import { encodeJwt } from '../../tests/jwt.helper';
import * as mocks from '../../tests/setup.mocks';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';

mocks.localStorage.clear();

const fakeVerifyEmail = async (params: { query: Function, variables: { authCode: string } }) =>
  ({data: { verifyEmail: { jwt: encodeJwt({id: Math.random() }) } } });

function setup(verifyEmail: typeof fakeVerifyEmail = fakeVerifyEmail) {

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
                <TwoFactorContainer history={[]} verifyEmail={fakeVerifyEmail} />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    /**
     * Sets authCode
     *
     * @return authCode value and form
     */
    function populateForm(wrapper: ReactWrapper<Props, {}>) {

        const authCode = casual.password;

        const form = wrapper.find('form').first();
        (wrapper.find('input[name="authCode"]').instance() as {} as HTMLInputElement).value = authCode;

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

                const wrapper = setup(async (params: { query: Function, variables: { authCode: string } }) => {

                    expect(expected).toEqual(params.variables.authCode);

                    return {
                        data: {
                            verifyEmail: {
                                jwt: encodeJwt({
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
