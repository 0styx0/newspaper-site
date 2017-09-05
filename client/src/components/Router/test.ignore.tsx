import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import RouterContainer from './container';
import localStorageMock from '../../tests/localstorage.mock';

// TODO: this file does not work due to graphql issues (client does not exist)

describe('<RouterContainer>', () => {

    describe('snapshots', () => {

        function snap() {

            const tree = renderer.create(
                <MemoryRouter>
                    <RouterContainer />
                </MemoryRouter>
            ).toJSON();
            expect(tree).toMatchSnapshot();
        }

        test('when not logged in, renders only public paths', () => {

            localStorageMock.clear();
            snap();
        });

        test('when logged in, renders all paths', () => {
            //
        });

        test('when not logged in and try to access private path, redirect to MainPage', () => {
            //
        });

        test('when accessing nonexistant route, go to MainPage', () => {
            //
        });

    });
});
