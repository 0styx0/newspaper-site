import * as React from 'react';
import { ModifiableUserInfoContainer } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import * as casual from 'casual';

import { ModifiableUserInfo } from '../shared.interfaces';

import userData from './__snapshots__/user.examples';

casual.define('user', (twoFactor: boolean, notificationStatus: boolean): ModifiableUserInfo => {

    return {
        email: casual.email,
        twoFactor,
        notificationStatus,
        id: casual.word
    };
});

type CustomCasualData = casual & {user: (twoFactor: boolean, notificationStatus: boolean) => ModifiableUserInfo};

const customCasual = casual as CustomCasualData;

function setup(
    userOptions: {notificationStatus: boolean, twoFactor: boolean},
    mockGraphql: {updateUser?: Function, deleteUser?: Function} = {}
) {

    const mockFunc = () => true;

    return mount(
        <ModifiableUserInfoContainer
            updateUser={mockGraphql.updateUser || mockFunc}
            deleteUser={mockGraphql.deleteUser || mockFunc}
            privateUserData={{
            users: [customCasual.user(userOptions.twoFactor, userOptions.notificationStatus)] // always length = 1
            }}
        />
    );
}

describe('<ModifiableUserInfoContainer>', () => {

    describe('snapshots', () => {

        function testSnap(data: ModifiableUserInfo) {

            const tree = renderer.create(
                <ModifiableUserInfoContainer
                    updateUser={() => true}
                    deleteUser={() => true}
                    privateUserData={{
                        users: [data]
                    }}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('should have notifications checked if notificationStatus is true',
           () => testSnap(userData.onlyNotifications));

        it('should have twoFactor checked if twoFactor is true', () => testSnap(userData.only2fa));

        it('should have both checked if both are true', () => testSnap(userData.bothTrue));

        it('should have none checked if both are false', () => testSnap(userData.bothFalse));
    });
});