import * as React from 'react';
import Link from './Link';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';

describe('<Link>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {


            const tree = renderer.create(
                <MemoryRouter>
                    <Link profileLink="hello" fullName="Bob Smith" />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});
