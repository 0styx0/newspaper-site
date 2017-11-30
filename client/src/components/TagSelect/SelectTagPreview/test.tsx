import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import SelectTagPreview from './';
import { mount } from 'enzyme';

import { setupComponent } from '../../../tests/enzyme.helpers';




describe('<SelectTagPreview>', () => {

    function setup() {

        return mount(
            <MemoryRouter>
                <SelectTagPreview />
            </MemoryRouter>
        );
    }

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(
                <MemoryRouter>
                    <SelectTagPreview />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('#onChange', () => {

        it('redirects to e.target.value', () => {

            const wrapper = setup();
            const component = setupComponent(wrapper, SelectTagPreview);

            expect(component.state.redirect).toBe('');

            const optionToChange = wrapper.find('option').at(0) as any;

            optionToChange.simulate('input');

            expect(component.state.redirect).toBe(optionToChange.instance().value);
        });
    });
});
