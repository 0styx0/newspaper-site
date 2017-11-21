/**
 *
 *
 * NOTE: tests in this file cannot run due to errors with apollo
 *
 * Suggestions:
 *  1) See if mocking the server with graphql-tools will fix this
 *      Problems:
 *          1) The schema is in the backend and I've had no luck with being able to import it
 *          2) I doubt that would help since it's a subcomponent that's causing the issue
 *  2) Stop working on this test (for now at least) and come back another time
 *  TODO:
 *
 */



import casual from '../../tests/casual.data';
import { Story } from './shared.interfaces';
import { Comment } from '../../components/CommentList/shared.interface';
import { StoryContainer } from './container';
import { ApolloProvider } from 'react-apollo';

import * as React from 'react';
import * as renderer from 'react-test-renderer';

// import { mount } from 'enzyme';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';

// import snapData from './__snapshots__/articles.example';

localStorageMock.setItem('jwt', JSON.stringify([, {level: 3}]));

type CustomCasual = typeof casual & {
    comments: Comment[],
    article: Story
};

const customCasual = casual as CustomCasual;

customCasual.define('comments', () => {

    let amount = casual.randomPositive;
    const comments = [] as Comment[];

    while (amount-- > 0) {

        comments.push({
            id: casual.word + '--' + amount,
            content: casual.text,
            dateCreated: casual.dateCreated,
            canDelete: true,
            author: {
                fullName: casual.full_name,
                profileLink: casual.word,
                id: casual.word + '--' + amount
            }
        });
    }

    return comments;
});

customCasual.define('article', (): Story => {

    return {
        id: casual.word,
        article: `<h1>${casual.title}</h1><h4>${casual.title}</h4>${casual.text}`,
        canEdit: true,
        comments: customCasual.comments,
        tags: casual.tags
    };
});

describe('<StoryContainer>', () => {

    describe('snapshots', () => {

        function testSnap(article: Story) {

            const tree = renderer.create(
                <ApolloProvider client={{} as any}>
                    <MemoryRouter>
                        <StoryContainer
                            client={{
                                query: async () => ({
                                    data: {
                                        articles: [article]
                                    }
                                } as any)
                            }}
                            editArticle={() => true as any}
                        />
                    </MemoryRouter>
                </ApolloProvider>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        }

        it('does not allow edits when props.canEdit is false', () => {

            const article = customCasual.article;
            article.canEdit = false;

            testSnap(article);
        });

        it('does allow edits when props.canEdit is true', () => {

            const article = customCasual.article;
            article.canEdit = true;

            testSnap(article);
        });
    });

    describe('#onSaveEdits', () => {

       it('saves header to state.header when header is edited', () => {
           //
       });

       it('saves body to state.body when body is edited', () => {
           //
       });
    });

    describe('#onSubmit', () => {

        it('does not submit article if article has not changed', () => {
            //
        });

        it('submits the edited article when submit button is clicked', () => {
            //
        });

        it('submits in correct format', () => {
            //
        });
    });
});