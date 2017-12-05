import * as React from 'react';
import LogoutContainer from './container';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import setFakeJwt from '../../tests/jwt.helper';
import { mount } from 'enzyme';
import cache from '../../apolloCache';
import * as sinon from 'sinon';

setFakeJwt({level: 3});

describe('<LogoutContainer />', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(
                <MemoryRouter>
                    <LogoutContainer />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('button#onClick', () => {

        it('removes jwt from localstorage when clicked', () => {

            const wrapper = mount(
                <MemoryRouter>
                    <LogoutContainer />
                </MemoryRouter>
            );

            expect(localStorage.getItem('jwt')).toBeTruthy();

            wrapper.find('button').simulate('click');

            expect(localStorage.getItem('jwt')).toBeFalsy();
        });

        it('clears cache', () => {

            const spy = sinon.spy();
            cache.reset = spy;

            const wrapper = mount(
                <MemoryRouter>
                    <LogoutContainer />
                </MemoryRouter>
            );

            wrapper.find('button').simulate('click');

            expect(spy.called).toBeTruthy();

        });
    });
});
