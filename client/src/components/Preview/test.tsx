import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import Preview from './';

describe('<Preview>', () => {

    describe('snapshots', () => {

        it('should render correctly', () => {

            const tree = renderer.create(
                <MemoryRouter>
                    <Preview
                        url="random_string"
                        issue={21}
                        lede="<p>This is a lede</p>"
                        views={34}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});
