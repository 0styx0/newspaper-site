import casual from '../../tests/casual.data';
import { Story } from './shared.interfaces';
import { Comment } from '../../components/CommentList/shared.interface';
import StoryContainerWithGraphql, { StoryContainer } from './container';

import * as React from 'react';

import createHistory from 'history/createBrowserHistory';
import { renderWithGraphql } from '../../tests/snapshot.helper';
import mockGraphql, { createMutation, mountWithGraphql } from '../../tests/graphql.helper';
import { ArticleQuery } from '../../graphql/article';
import snapData from './__snapshots__/stories.example';
import setFakeJwt from '../../tests/jwt.helper';
import { setupComponent } from '../../tests/enzyme.helpers';
import { EditArticle } from '../../graphql/articles';
import { ReactWrapper } from 'enzyme';
import * as sinon from 'sinon';
const wait = require('waait');

setFakeJwt( { level: 3 } );
const history = createHistory();

type CustomCasual = typeof casual & {
    comments: Comment[],
    story: Story,
    data: {
        articles: Story
    }
};

const customCasual = casual as CustomCasual;

function setHistory() {

    const issue = casual.randomPositive;
    const url = casual.string; // not articleUrl since that's encoded
    history.push(`/stories/${issue}/url/${url}`);

    return {
        issue,
        url
    };
}

setHistory();

customCasual.define('story', (): Story & { displayOrder: number } => {

    return {
        id: casual.word,
        article: casual.article,
        canEdit: true,
        comments: customCasual.comments,
        tags: casual.tags,
        displayOrder: casual.randomPositive
    };
});

customCasual.define('data', () => {
    return {
        articles: [customCasual.story]
    };
});

const waitTime = 4;
describe('<StoryContainer>', () => {

    function setupQuery() {

        const data = customCasual.data;
        const { issue, url } = setHistory();

        return {
            query: createMutation(ArticleQuery, { issue, url }, data),
            data,
            issue,
            url
        };
    }

    async function setup(graphql: any[] = []
    ) {

        const wrapper = await mountWithGraphql(
            graphql,
            <StoryContainerWithGraphql />,
            waitTime
        );

        return wrapper;
    }

    function edit(
        wrapper: ReactWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>,
        selector: string,
        content: string
    ) {

        const elt = wrapper.find(selector);
        elt.simulate('blur', { target: { innerHTML: content } });

        const component = setupComponent(wrapper, StoryContainer);

        return component;
    }

    describe('snapshots', () => {

        async function testSnap(canEdit: boolean) {

            const { issue, url } = setHistory();
            const snapCopy = JSON.parse(JSON.stringify(snapData));
            snapCopy.canEdit = canEdit;

            await renderWithGraphql(
                mockGraphql(
                    [
                        createMutation(ArticleQuery, { issue, url }, { articles: [snapCopy] }),
                    ],
                    <StoryContainerWithGraphql />
                    ),
                waitTime
            );
        }

        it('does not allow edits when props.canEdit is false', async () => {

            await testSnap(false);
        });

        it('does allow edits when props.canEdit is true', async () => {

            await testSnap(true);
        });
    });

    describe('#onSaveEdits', () => {

        async function setupEditTests(selector: string, content: string, stateKey: string) {

            const wrapper = await setup([
                setupQuery().query
            ]);

            // const content = casual.articleHeader;
            const component = edit(wrapper, selector, content);
            expect(component.state[stateKey]).toBe(content);
        }

        it('saves header to state.header when header is edited', async () => {

            const content = casual.articleHeader;
            await setupEditTests('header', content, 'heading');
        });

        it('saves body to state.body when body is edited', async () => {

            const content = casual.articleBody;
            await setupEditTests('.storyContainer', content, 'body');
        });
    });

    describe('#onSubmit', () => {

        it('does not submit article if article has not changed', async () => {

            const wrapper = await setup([
                setupQuery().query
            ]);

            const component = setupComponent(wrapper, StoryContainer);
            component.onSubmit = () => expect(false).toBeTruthy();
            wrapper.find('.editable-submit').simulate('click');
        });

        it('submits the edited article when submit button is clicked', async () => {

            const newHeader = casual.articleHeader;
            const newBody = casual.articleBody;
            const { query, data } = setupQuery();
            const article = data.articles[0];

            const spy = sinon.spy(StoryContainer.prototype, `onSubmit`);

            const wrapper = await setup([
                query,
                createMutation(
                    EditArticle,
                    { id: article.id, article: newHeader + newBody },
                    {
                        editArticle: {
                            id: article.id, tags: article.tags, displayOrder: article.displayOrder
                        }
                    }
                )
            ]);

            edit(wrapper, 'header', newHeader);
            edit(wrapper, '.storyContainer', newBody);

            wrapper.find('.editable-submit').simulate('click');
            await wait(waitTime);

            expect(spy.calledOnce).toBeTruthy();
            (StoryContainer.prototype.onSubmit as any).restore();
        });
    });
});
