import * as React from 'react';
import * as renderer from 'react-test-renderer';
import Select from './';

describe('<Select>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(
                <Select
                  label="Label"
                  props={{
                      name: 'hello',
                      children: [<option key="1" value="hi">Hi</option>]
                  }}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});