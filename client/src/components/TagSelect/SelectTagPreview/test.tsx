import * as React from 'react';
import SelectTagPreview from './';
import { setupComponent } from '../../../tests/enzyme.helpers';
import casual from '../../../tests/casual.data';
import mockGraphql, { mountWithGraphql } from '../../../tests/graphql.helper';
import { tagQueryMock } from '../../../tests/graphql.mocks';
import { renderWithGraphql } from '../../../tests/snapshot.helper';

describe('<SelectTagPreview>', () => {

    function setup() {

        return mountWithGraphql(
            [tagQueryMock],
            <SelectTagPreview />
        );
    }

    describe('snapshots', () => {

        it('renders correctly', async () => {

            await renderWithGraphql(
                mockGraphql(
                    [tagQueryMock],
                    <SelectTagPreview />
                )
            );
        });
    });

    describe('#onChange', () => {

        it('redirects to e.target.value', async () => {

            const wrapper = await setup();
            const component = setupComponent(wrapper, SelectTagPreview);

            expect(component.state.redirect).toBe('');

            const options = wrapper.find('option');

            const optionToChange = options.at(casual.integer(0, options.length - 1));

            optionToChange.simulate('input');

            expect(component.state.redirect).toBe(
                (optionToChange.instance() as {} as HTMLOptionElement).value
            );
        });
    });
});
