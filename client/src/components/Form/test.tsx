import * as React from 'react';
import * as renderer from 'react-test-renderer';
import FormContainer from './container';
import * as sinon from 'sinon';
import { mount } from 'enzyme';




describe('<FormContainer>', () => {

    function setup(onSubmit: Function = () => { return; }) {

        return mount(
            <FormContainer onSubmit={onSubmit}>
              <input key="1" type="text" name="fried rice" />
            </FormContainer>
        );
    }

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(
                <FormContainer onClick={() => null}>
                    <input key="1" type="text" value="hi" />
                    <input key="2" type="text" value="ri" />
                </FormContainer>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('#onSubmit', () => {

        it('calls preventDefault', () => {

            const wrapper = setup();
            const spy = sinon.spy();

            wrapper.find('form').first().simulate('submit', {preventDefault: spy});

            expect(spy.called).toBeTruthy();
        });

        it('calls stopPropagation', () => {

            const wrapper = setup();
            const spy = sinon.spy();

            wrapper.find('form').first().simulate('submit', {stopPropagation: spy});

            expect(spy.called).toBeTruthy();
        });

        it('calls actual onSubmit handler after intercepting it with correct args', () => {

            const spy = sinon.spy();
            const wrapper = setup((target: HTMLFormElement, event: Event) => {
                spy();
                expect(event.target).toEqual(target);
            });

            wrapper.find('form').first().simulate('submit');
            expect(spy.called).toBeTruthy();
        });
    });
});
