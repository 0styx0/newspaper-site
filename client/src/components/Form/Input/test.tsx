import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Input from './';

describe('<Input>', () => {

    describe('snapshots', () => {

        /**
         * Takes snapshots
         */
        function snap(abbr?: string) {

            const tree = renderer.create(
                <Input
                    label="Random"
                    props={{
                        placeholder: 'Hi'
                    }}
                    abbr={abbr}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();

        }

        it('renders correctly when abbr is given', () => snap('A very good hint'));

        it('renders correctly when abbr is NOT given', () => snap());
    });
});
