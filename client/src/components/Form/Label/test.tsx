import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Label from './';

describe('<Label>', () => {

    describe('snapshots', () => {

        /**
         * Takes snapshots
         */
        function snap(abbr?: string, required: boolean = false) {

            const tree = renderer.create(
                <Label
                    value="Label"
                    required={required}
                    abbr={abbr}
                    children={<input type="text" value="hello" />}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();

        }

        it('renders correctly when abbr is given and not required', () => snap('A very good hint'));

        it('renders correctly when abbr is NOT given and not required', () => snap());

        it('when required and no abbr', () => snap(undefined, true));

        it('when required and yes abbr', () => snap('Hello', true));
    });
});
