import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import NumberlineContainer from './container';

describe('<NumberlineContainer>', () => {

    describe('snapshots', () => {

        function snap(current: number, max: number) {

            const tree = renderer.create(
                <MemoryRouter>
                    <NumberlineContainer current={current} max={max} />
                </MemoryRouter>
            ).toJSON();
            expect(tree).toMatchSnapshot();
        }

        it('renders correctly with 5 numbers', () => snap(3, 5));

        it('with more than 5 makes an ellipses', () => snap(5, 20));

        it('with current in the middle of line', () => snap(20, 40));
    });
});
