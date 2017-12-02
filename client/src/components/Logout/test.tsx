import * as React from 'react';
import Logout from './';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import setFakeJwt from '../../tests/jwt.helper';
import { mount } from 'enzyme';

setFakeJwt({level: 3});

describe('<Logout>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(
                <MemoryRouter>
                    <Logout/>
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('button#onClick', () => {

        it('removes jwt from localstorage when clicked', () => {

            const wrapper = mount(
                <MemoryRouter>
                    <Logout />
                </MemoryRouter>
            );

            expect(localStorage.getItem('jwt')).toBeTruthy();

            wrapper.find('button').simulate('click');

            expect(localStorage.getItem('jwt')).toBeFalsy();
        });
    });
});
