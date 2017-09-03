import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import * as casual from 'casual';
import { EditableCommentContainer } from './container';
import setFakeJwt from '../../../tests/jwt.helper';
import localStorageMock from '../../../tests/localstorage.mock';
import { mount } from 'enzyme';
import * as sinon from 'sinon';

document.queryCommandSupported = () => true; // used in Editable component

describe('<EditableCommentContainer>', () => {

    const mockFunction = (() => { return; }) as any;

    function setup(id: string, functions = {addToList: mockFunction, createComment: mockFunction}) {

        return mount(
            <EditableCommentContainer
              artId={id}
              {...functions}
            />
        );
    }

    describe('snapshots', () => {

        /**
         * Takes snapshot
         */
        function snap() {

            const tree = renderer.create(
                <MemoryRouter>
                    <EditableCommentContainer
                      artId={casual.word}
                      addToList={mockFunction}
                      createComment={mockFunction}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('renders correctly when can edit', () => {

            setFakeJwt({id: casual.word});
            snap();
        });

        it('renders correctly when cannot edit', () => {

            localStorageMock.removeItem('jwt');
            snap();
        });
    });

    describe('#onSave', () => {

        beforeEach(() => setFakeJwt({id: casual.word}));

        it('saves content to state onBlur', () => {

            const wrapper = setup(casual.word);

            const content = casual.sentence;

            const contentEditable = wrapper.find('[contentEditable]').first() as any as {
                node: { innerHTML: string }, simulate: Function
            };

            contentEditable.node.innerHTML = content;
            contentEditable.simulate('blur');
            expect(wrapper.state().content).toBe(content);
        });

        it('calls commentDelete and addToList when button is clicked', () => {

            const spyComment = sinon.spy();
            const spyList = sinon.spy();

            const wrapper = setup(casual.word, {
                createComment: spyComment,
                addToList: spyList
            });

            wrapper.find('button').last().simulate('click');

            expect(spyComment.called).toBeTruthy();
            expect(spyList.called).toBeTruthy();
        });

        it('sends proper data to graphql', () => {

            const expected = {
                artId: casual.word,
                content: casual.sentence
            };

            const wrapper = setup(expected.artId, {
                createComment: (params: {variables: {artId: string, content: string}}) => {

                    expect(params.variables.artId).toBe(expected.artId);
                    expect(params.variables.content).toBe(expected.content);
                },
                addToList: mockFunction
            });

            wrapper.state().content = expected.content;
            wrapper.find('button').last().simulate('click');
        });

        it('sends content to props.addToList', () => {

            const expectedContent = casual.sentence;

            const wrapper = setup(casual.word, {
                createComment: mockFunction,
                addToList: (content: string) => expect(content).toBe(expectedContent)
            });

            wrapper.state().content = expectedContent;
            wrapper.find('button').last().simulate('click');
        });
    });

});
