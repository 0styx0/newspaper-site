import * as React from 'react';
import { MemoryRouter } from 'react-router';
import * as renderer from 'react-test-renderer';
import CommentListContainer from './container';
import casual from '../../tests/casual.data';
import setFakeJwt from '../../tests/jwt.helper';
import localStorageMock from '../../tests/localstorage.mock';
import { mount } from 'enzyme';
// import * as sinon from 'sinon';
import { Comment } from './shared.interface';

/**
 * TODO: Ignored since child components use graphql functions. Try getting fake grapqhl server
 */

casual.define('comments', (amount: number): Comment => {

    const comments: Comment[] = [];

    while (amount-- > 0) {

        comments.push({
            id: casual.word + '--' + amount,
            canDelete: false,
            content: casual.sentence,
            dateCreated: casual.dateCreated,
            author: {
                fullName: casual.full_name,
                profileLink: casual.word,
                id: casual.word + '--' + amount
            }
        });
    }

    return comments;
});

describe('<CommentListContainer>', () => {

    function setup() {

        return mount(
            <CommentListContainer
              comments={casual.comments(casual.randomPositive)}
              artId={casual.word}
            />
        );
    }

    describe('snapshots', () => {

        /**
         * Takes snapshots
         */
        function snap() {

            const tree = renderer.create(
                <MemoryRouter>
                    <CommentListContainer
                        comments={casual.comments(casual.randomPositive)}
                        artId={casual.word}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();

        }

        it('renders correctly when can add', () => {

            setFakeJwt({level: 3, id: casual.word});
            snap();
        });

        it('renders correctly when cannot add', () => {

            localStorageMock.removeItem('jwt');
            snap();
        });
    });

    describe('#onAdd', () => {

        it('gets called after comment submission', () => {
            //
        });

        it('gets called with correct `content`', () => {

            //
        });
    });
});
