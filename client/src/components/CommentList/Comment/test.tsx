import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import * as casual from 'casual';
import { CommentContainer, Props } from './container';
import setFakeJwt from '../../../tests/jwt.helper';
import * as mocks from '../../../tests/setup.mocks';
import snapData from './__snapshots__/props.example';
import { mount, configure } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as sinon from 'sinon';



const deleteCommentMock = (params: {variables: {id: string}}) => { return; };

casual.define('comment', (): Props => ({
    profileLink: casual.word,
    author: casual.full_name,
    content: casual.sentences(casual.integer(1, 100)), // 1-100 = random
    authorid: casual.word,
    id: casual.word,
    deleteComment: deleteCommentMock
}));

type CustomCasual = typeof casual & {comment: Props};
const customCasual = casual as CustomCasual;

describe('<CommentContainer>', () => {

    describe('snapshots', () => {

        it(`renders correctly when can't delete`, () => {

            mocks.localStorage.removeItem('jwt');

            const tree = renderer.create(
                <MemoryRouter>
                    <CommentContainer {...snapData} />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });

        it(`renders correctly when could delete`, () => {

            setFakeJwt({id: casual.word, level: 3});

            const tree = renderer.create(
                <MemoryRouter>
                    <CommentContainer {...snapData} />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    function setup(data: Props) {

        return mount(
            <MemoryRouter>
                <CommentContainer {...data} />
            </MemoryRouter>
        );
    }

    describe('#onDelete', () => {

        beforeEach(() => setFakeJwt({id: casual.word, level: 3}));

        test('clicking on delete button calls #onDelete', () => {

            const spy = sinon.spy();
            const data = customCasual.comment;
            data.deleteComment = spy;

            const wrapper = setup(data);
            wrapper.find('.deleteReply').first().simulate('click');

            expect(spy.called).toBeTruthy();
        });

        test('data is formatted correctly when submitted to graphql', () => {

            const data = customCasual.comment;
            data.deleteComment = (params: {variables: { id: string }}) => {
                expect(params.variables.id).toBe(data.id);
            };

            const wrapper = setup(data);
            wrapper.find('.deleteReply').first().simulate('click');
        });
    });
});
