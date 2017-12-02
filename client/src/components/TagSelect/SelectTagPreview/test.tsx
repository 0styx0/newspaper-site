import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import SelectTagPreview from './';
import { mount } from 'enzyme';
import { setupComponent } from '../../../tests/enzyme.helpers';
import casual from '../../../tests/casual.data';

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

            const options = wrapper.find('option');

            const optionToChange = options.at(casual.integer(0, options.length));

            optionToChange.simulate('input');

            expect(component.state.redirect).toBe(
                (optionToChange.instance() as {} as HTMLOptionElement).value
            );
        });
    });
});
