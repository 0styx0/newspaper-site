import * as React from 'react';
import { ModifiableUserInfoContainer, Props, State } from './container';
import * as renderer from 'react-test-renderer';
import * as casual from 'casual';
import { randomCheckboxToggle, setInput, submitForm } from '../../../tests/enzyme.helpers';
import * as sinon from 'sinon';
import { mount, ReactWrapper } from 'enzyme';
import { ModifiableUserInfo } from '../shared.interfaces';
import userData from './__snapshots__/user.examples';

casual.define('user', (twoFactor: boolean, notifications: boolean): ModifiableUserInfo => {

    return {
        email: casual.email,
        twoFactor,
        notifications,
        id: casual.word
    };
});

type CustomCasualData = typeof casual & {user: (twoFactor: boolean, notifications: boolean) => ModifiableUserInfo};

const customCasual = casual as CustomCasualData;

function setup(
    userOptions: {notifications: boolean, twoFactor: boolean} = { notifications: false, twoFactor: false },
    mockGraphql: { updateUser?: Function, deleteUser?: Function } = {}
) {

    const mockFunc = async () => true;

    const wrapper = mount(
        <ModifiableUserInfoContainer
            updateUser={mockGraphql.updateUser || mockFunc}
            deleteUser={mockGraphql.deleteUser || mockFunc}
            fetchPrivateUserData={{
                refetch: async () =>
                    ({ data: { users: [customCasual.user(userOptions.twoFactor, userOptions.notifications)] } })
            }}
        />
    );

    wrapper.setState({
        privateUserData: {
            users: [customCasual.user(userOptions.twoFactor, userOptions.notifications)]
        }
    });

    return wrapper;
}

describe('<ModifiableUserInfoContainer>', () => {

    describe('snapshots', () => {

        function testSnap(data: ModifiableUserInfo) {

            const component = (
                <ModifiableUserInfoContainer
                    updateUser={() => true}
                    deleteUser={() => true}
                    fetchPrivateUserData={{ refetch: () => ({ data: { users: [data] } }) }}
                />
            );

            const tree = renderer.create(component);

            expect(tree.toJSON()).toMatchSnapshot();
        }

        it('should have notifications checked if notifications is true',
           () => testSnap(userData.onlyNotifications));

        it('should have twoFactor checked if twoFactor is true', () => testSnap(userData.only2fa));

        it('should have both checked if both are true', () => testSnap(userData.bothTrue));

        it('should have none checked if both are false', () => testSnap(userData.bothFalse));
    });

    describe('modifiable inputs', () => {

        /**
         * Tests if input[name=<name>] add/removes from state.updates.<name> when expected
         *
         * @param name - of input to check
         * @param pathToState - index of `state` to check
         */
        function toggleChecker(name: string, pathToState: string[] = ['updates', name]) {

            /**
             * Toggles checkbox and sees if state was changed
             *
             * @param shouldCheck - if final state of checkbox will be checked
             */
            function toggleAndCheckState(shouldCheck: boolean) {

                const userOptions = {notifications: false, twoFactor: false};
                userOptions[name] = !shouldCheck; // make sure that initial state is not what is expected

                const wrapper = setup(userOptions);

                randomCheckboxToggle(wrapper.find(`input[name="${name}"]`)); // not random in this case since only 1

                const plainState = (wrapper.find(ModifiableUserInfoContainer)
                    .instance() as {} as ModifiableUserInfoContainer).state;

                // adds pathToState to `component.state`
                const stateToUpdate = pathToState.reduce((accum, elt) => accum[elt], plainState);

                if (shouldCheck) {
                    expect(stateToUpdate).toBeTruthy();
                } else {
                    expect(stateToUpdate).toBeFalsy();
                }
            }

            it(`gets added to \`state\` when toggled on`, () => toggleAndCheckState(true));

            it(`gets removed from \`state\` when toggled off`,
               () => toggleAndCheckState(false));
        }

        describe('twoFactor', () => toggleChecker('twoFactor'));

        describe('notifications', () => toggleChecker('notifications'));

        describe('input [name=delAcc]', () => {

            let wrapper: ReactWrapper<Props, State>;
            let deleteBox: ReactWrapper<HTMLInputElement, {}>; // don't know if this is correct type

            /**
             * Sets `wrapper`and `deleteBox` and toggles the deleteBox once
             */
            beforeEach(() => {

                wrapper = setup();
                deleteBox = wrapper
                    .find(`input[name="delAcc"]`) as {} as ReactWrapper<HTMLInputElement, {}>;

                randomCheckboxToggle(deleteBox); // not random in this case since only 1
            });

            it('makes `state.delete` true if toggled on', () => {

                const deleteState = (wrapper
                    .find(ModifiableUserInfoContainer)
                    .instance() as {} as ModifiableUserInfoContainer)
                    .state
                    .delete;

                expect(deleteState).toBeTruthy();
            });

            it('makes `state.delete` false if toggled off', () => {

                // toggle off
                randomCheckboxToggle(deleteBox);

                const deleteState = (wrapper
                    .find(ModifiableUserInfoContainer)
                    .instance() as {} as ModifiableUserInfoContainer)
                    .state
                    .delete;

                expect(deleteState).toBeFalsy();
            });
        });
    });

    describe('submitting data', () => {

        describe('should send same data as is in `state`', () => {

            describe('when only 1 has changed', () => {

                [
                    ['twoFactor', 'twoFactor'],
                    ['notifications', 'notifications'],
                ].forEach(elt =>

                    test(`${elt[0]} has changed`, () => {

                        const expectedValue = true;
                        let password = '';

                        const wrapper = setup(
                            {notifications: false, twoFactor: false},
                            {updateUser: async (data: {variables: {twoFactor?: boolean, notifications?: boolean}}) => {

                                const expected = {
                                    password
                                };
                                expected[elt[1]] = expectedValue;

                                expect(data.variables).toEqual(expected);
                        }});

                        (wrapper
                            .find(ModifiableUserInfoContainer)
                            .instance() as {} as ModifiableUserInfoContainer)
                            .state
                            .updates[elt[1]] = expectedValue;

                        password = setInput(wrapper);
                        submitForm(wrapper);
                    })
                );

                test('when deleteAcc has changed', () => {

                    const expectedValue: string[] = [];

                    const wrapper = setup(
                        { notifications: false, twoFactor: false },
                        {deleteUser: async (data: {variables: {ids: [string]}}) => {

                            expect(data.variables).toEqual({
                                ids: expectedValue
                            });
                    }});

                    expectedValue.push((wrapper
                        .find('input[name="delAcc"]')
                        .instance() as {} as HTMLInputElement)
                        .value);

                    (wrapper
                        .find(ModifiableUserInfoContainer)
                        .instance() as ModifiableUserInfoContainer)
                        .setState({
                            delete: true
                        });

                    submitForm(wrapper);
                });
            });
        });

        test('delete and an update has changed', () => {

            const expectedDeleteValue: string[] = [];
            const expectedUpdateValue = true;
            const fieldToUpdate = casual.coin_flip ? 'noticationStatus' : 'twoFactor';

            const wrapper = setup(
                {notifications: false, twoFactor: false},
                {
                    deleteUser: async (data: {variables: {ids: [string]}}) => {

                        expect(data.variables).toEqual({
                            id: expectedDeleteValue
                        });
                    },
                    updateUser: async (data: {variables: {twoFactor?: boolean, notifications?: boolean}}) => {

                        const expected = {};
                        expected[fieldToUpdate] = expectedUpdateValue;

                        expect(data.variables).toEqual(expected);
                    }
                }
            );

            expectedDeleteValue.push(
                (wrapper
                    .find('input[name="delAcc"]')
                    .instance() as {} as HTMLInputElement
                ).value
            );

            (wrapper
                .find(ModifiableUserInfoContainer)
                .instance() as ModifiableUserInfoContainer)
                .setState({
                    delete: true
                });

            (wrapper
                .find(ModifiableUserInfoContainer)
                .instance() as {} as ModifiableUserInfoContainer)
                .state.updates[fieldToUpdate] = expectedUpdateValue;
        });

        test('2 updates have changed', () => {

            const expectedValue = true;
            let password = '';

            const wrapper = setup(
                {notifications: false, twoFactor: false},
                {updateUser: async (data: {variables: {twoFactor?: boolean, notifications?: boolean}}) => {

                const expected = {
                    notifications: expectedValue,
                    twoFactor: expectedValue,
                    password
                };

                expect(data.variables).toEqual(expected);
            }});

            (wrapper
                .find(ModifiableUserInfoContainer)
                .instance() as {} as ModifiableUserInfoContainer)
                .setState({
                    updates: {
                        notifications: expectedValue,
                        twoFactor: expectedValue
                    }
                });

            password = setInput(wrapper);

            wrapper.find('form').first().simulate('submit');
        });

        it(`shouldn't send if no data`, () => {

            const spy = sinon.spy();

            const wrapper = setup(
                {notifications: false, twoFactor: false},
                {
                    updateUser: async () => spy(),
                    deleteUser: async () => spy()
                }
            );

            submitForm(wrapper);

            expect(spy.called).toBeFalsy();
        });
    });
});
