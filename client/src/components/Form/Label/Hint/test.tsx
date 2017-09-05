import * as React from 'react';
import * as renderer from 'react-test-renderer';
import HintContainer from './container';
import { mount } from 'enzyme';
import casual from '../../../../tests/casual.data';

describe('<HintContainer>', () => {

    describe('snapshots', () => {

        /**
         * Takes snapshots
         */
        function snap(title: string) {

            const tree = renderer.create(
                <HintContainer
                    title={title}
                    children={<label>Hi<input type="text" value="hello" /></label>}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();

        }

        it('renders correctly', () => snap('Hello'));
    });

    function setup() {

        return mount(
            <HintContainer
              title={casual.sentences(casual.randomPositive)}
              children={<label>Hi<input type="text" /></label>}
            />
        );
    }

    /**
     * Shows hint
     */
    function reveal(wrapper: any) {

        wrapper.find('abbr').first().simulate('click');

        expect((wrapper.find('.abbrMessage').first() as any).nodes).toHaveLength(1);
    }

    describe('hint is revealed when', () => {

        it('is clicked', () => {

            const wrapper = setup();

            wrapper.find('abbr').first().simulate('click');

            expect((wrapper.find('.abbrMessage').first() as any).nodes).toHaveLength(1);
        });

        test(`its props.children is invalid (after user has done some input)`, () => {

            const wrapper = setup();

            wrapper.find('input').first().simulate('input', {target: {checkValidity: () => false}});

            expect((wrapper.find('.abbrMessage').first() as any).nodes).toHaveLength(1);
        });
    });

    describe('hint is hidden when', () => {

        test('component is created', () => {

            const wrapper = setup();

            expect((wrapper.find('.abbrMessage').first() as any).nodes).toHaveLength(0);
        });

        it('is clicked a second time', () => {

            const wrapper = setup();
            reveal(wrapper);

            wrapper.find('abbr').first().simulate('click');

            expect((wrapper.find('.abbrMessage').first() as any).nodes).toHaveLength(0);
        });

        test(`its input becomes valid (after user has done some input)`, () => {

            const wrapper = setup();
            reveal(wrapper);

            wrapper.find('input').first().simulate('input', {target: {checkValidity: () => true}});

            expect((wrapper.find('.abbrMessage').first() as any).nodes).toHaveLength(0);
        });
    });
});
