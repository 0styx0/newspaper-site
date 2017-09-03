import * as React from 'react';
import * as renderer from 'react-test-renderer';
import casual from '../../tests/casual.data';
import EditableContainer from './container';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

document.queryCommandSupported = () => true;

describe('<EditableContainer>', () => {

    function setup(onSubmit: Function) {

        return mount(
            <EditableContainer
              children={<div />}
              canEdit={true}
              buttons="all"
              onSubmit={onSubmit}
            />
        );
    }

    describe('snapshots', () => {

        /**
         * Takes snapshots
         */
        function snap(buttons: 'all' | 'basic' | 'none', canEdit: boolean = true) {

            const tree = renderer.create(
                <EditableContainer
                    children={<p>Hi, this is a test</p>}
                    canEdit={canEdit}
                    buttons={buttons}
                    onSubmit={casual.function}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        describe('render buttons correctly when set to', () => {

            it('all', () => snap('all'));

            it('basic', () => snap('basic'));

            it('none', () => snap('none'));
        });

        describe('render correctly when canEdit is set to', () => {

            test('true', () => snap('all', true));

            test('false', () => snap('all', false));
        });
    });

    describe('onSubmit', () => {

        it('is called when submit button is clicked', () => {

            const spy = sinon.spy();

            const wrapper = setup(spy);

            wrapper.find('button').last().simulate('click');

            expect(spy.called).toBeTruthy();
        });
    });
});