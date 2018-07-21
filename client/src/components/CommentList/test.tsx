import * as React from 'react';
import * as sinon from 'sinon';
import CommentListContainer from './container';
import customCasual from '../../tests/casual.data';
import setFakeJwt from '../../tests/jwt.helper';
import localStorageMock from '../../tests/localstorage.mock';
import { renderWithGraphql } from '../../tests/snapshot.helper';
import mockGraphql, { mountWithGraphql, createMutation } from '../../tests/graphql.helper';
import snapData from './__snapshots__/comments.example';
import { CommentCreate } from '../../graphql/comment';
import { Comment } from './shared.interface';
const wait = require('waait');


describe('<CommentListContainer>', () => {

    function setup(
        graphql: any[] = [],
        artId: string = customCasual.word,
        comments: Comment[] = customCasual.comments
    ) {

        return mountWithGraphql(
            graphql,
            (
                <CommentListContainer
                  comments={comments}
                  artId={artId}
                />
            )
        );
    }

    describe('snapshots', () => {

        /**
         * Takes snapshots
         */
        async function snap() {

            await renderWithGraphql(
                mockGraphql(
                    [],
                    (
                        <CommentListContainer
                          comments={snapData}
                          artId={'random-id'}
                        />
                    )
                )
            );
        }

        it('renders correctly when can add', async () => {

            setFakeJwt({level: 3, id: customCasual.word});
            await snap();
        });

        it('renders correctly when cannot add', async () => {

            localStorageMock.removeItem('jwt');
            await snap();
        });
    });

    describe('#onAdd', () => {

        it('gets called after comment submission (with correct data)', async () => {

            setFakeJwt({level: 3, id: customCasual.word});
            const spy = sinon.spy(CommentListContainer.prototype, 'onAdd');

            const comment = customCasual.comments[0];
            const artId = customCasual.word;

            const wrapper = await setup(
                [
                    createMutation(
                        CommentCreate,
                        { artId, content: comment.content },
                        { createComment: { id: comment.id }}
                    )
                ],
                artId
            );

            wrapper.find('#reply .content').simulate('blur', { target: { innerHTML: comment.content } });
            wrapper.find('.editable-submit').simulate('click');
            await wait(0);

            expect(spy.calledOnce).toBeTruthy();
        });
    });
});
