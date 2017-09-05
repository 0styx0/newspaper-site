import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import SelectTagPreview from './';
import { mount } from 'enzyme';

describe('<Slideshow>', () => {

    function setup(images: Image[]) {

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
            const component = (wrapper.find(SelectTagPreview) as any).node;

            expect(component.state.redirect).toBe('');

            const optionToChange = wrapper.find('option').first();

            optionToChange.simulate('change');

            expect(component.state.redirect).toBe(`/tag/${optionToChange.node.value}`);
        });
    });
});