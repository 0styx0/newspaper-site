import * as React from 'react';
import '../../tests/setup.mocks';
import PublishContainerWithApollo, { PublishContainer, Props, State } from './container';
import * as renderer from 'react-test-renderer';
import * as sinon from 'sinon';
import casual from '../../tests/casual.data';
import { submitForm, setupComponent, setInput, setSelectByName } from '../../tests/enzyme.helpers'
import { ReactWrapper } from 'enzyme';
import setFakeJwt from '../../tests/jwt.helper';
import { getJWT } from '../../helpers/jwt/index';
import { ApolloProvider } from 'react-apollo';
const wait = require('waait');

import mockGraphql, { createQuery, createMutation, mountWithGraphql } from '../../tests/graphql.helper';
import { ArticleCreate } from '../../graphql/article';
import { TagCreate, TagQuery } from '../../graphql/tags';
import { tagQueryMock } from '../../tests/graphql.mocks';
import { renderWithGraphql } from '../../tests/snapshot.helper';

setFakeJwt({ level: 3 });


describe('<PublishContainer>', () => {

    function mockCreateArticle() {

        return createQuery(
            ArticleCreate,
            {
                createArticle: {
                    url: casual.articleUrl,
                    issue: casual.issue
                }
            }
        );
    }

    async function setup(graphql = []
    ) {

        return mountWithGraphql(
            graphql,
            <PublishContainerWithApollo history={[]} />
        );
    }

    /**
     * Gives PublishContainer a fake version of state.editor (that has all functionality needed)
     */
    function setFakeEditor(component: PublishContainer, initialContent: string = '') {

        component.setState({

            editor: {
                content: initialContent,
                setContent(content: string) {
                    this.content = content;
                },
                getContent() {
                    return this.content!;
                }
            }
        });
    }

    interface FormData {
        url: string;
        tags: Set<string>;
        article: string;
    }

    function generateFormData(): FormData {

        return {
            url: casual.articleUrl,
            article: casual.article,
            tags: casual.tags
        };
    }

    /**
     * Fills out form with random data
     */
    function fillOutForm(wrapper: ReactWrapper<Props, State>, formData: FormData) {

        const { url, tags, article } = formData;

        const component = setupComponent(wrapper, PublishContainer);
        setFakeEditor(component, article);

        setInput(wrapper, url, 'name');

        setSelectByName(wrapper, 'tags', tags);

        return {
            url,
            article,
            tags: [...tags]
        };
    }
    describe('snapshots', () => {

        async function snap(level: number) {

            const oldLevel = getJWT().level;
            setFakeJwt({ level });

            await renderWithGraphql(
                mockGraphql(
                    [tagQueryMock],
                    <PublishContainerWithApollo />
                )
            )

            setFakeJwt({ level: oldLevel });
        }

        it('renders correctly when can add tag', async () => {
            await snap(3);
        });

        it('does not render option to add tag if not level 2', async () => {
            await snap(1);
        });
    });

    describe('#autoFormat', () => {

        /**
         * Sets up and tests #autoFormat
         *
         * @param content - original, badly formatted content
         * @param expected - properly formatted version of content
         */
        async function testAutoFormat(content: string, expected: string) {

            const wrapper = await setup();
            const component = setupComponent(wrapper, PublishContainer);
            setFakeEditor(component, content);
            component.autoFormat();
            const newEditorContents = component.state.editor!.getContent();

            expect(newEditorContents).toBe(expected);
        }

        it(`adds an <h0> if none exists and there's text`, async () => {

            const author = casual.full_name;
            const title = casual.title;

            await testAutoFormat(`<h4>${title}</h4><p>${author}</p>`, `<h1>${title}</h1><h4>${author}</h4>`);
        });

        it('adds an <h4> if none exists', () => {

            const author = casual.full_name;
            const title = casual.title;

            testAutoFormat(`<h1>${title}</h1><p>${author}</p>`, `<h1>${title}</h1><h4>${author}</h4>`);
        });

        it('adds an <h1> and <h4> if none exists', () => {

            const author = casual.full_name;
            const title = casual.title;

            testAutoFormat(`<p>${title}</p><strong>${author}</strong>`, `<h1>${title}</h1><h4>${author}</h4>`);
        });

        it(`doesn't mess with any html other than first 2 tags`, () => {

            const author = casual.full_name;
            const title = casual.title;

            testAutoFormat(
                `<p>${title}</p><strong>${author}</strong><em>This should not change</em>`,
                `<h1>${title}</h1><h4>${author}</h4><em>This should not change</em>`
            );
        });
    });

    describe('#onTagChange', () => {

        it(`toggles addTag input when 'other' is selected`, async () => {

            const wrapper = await setup();
            setupComponent(wrapper, PublishContainer);

            expect(wrapper.find('input[name="addTag"]').length).toBe(0);

            setSelectByName(wrapper, 'tags', ['other']);

            expect(wrapper.find('input[name="addTag"]').length).toBe(1);
        });

        it('submits new tag to createTag', async () => {

            let newTag = casual.word;

            const formData = generateFormData();
            formData.tags = [newTag];

            const wrapper = await setup([
                createMutation(
                    ArticleCreate,
                    formData,
                    { createArticle: { issue: casual.randomPositive, url: casual.string}}
                ),
                createMutation(
                    TagCreate,
                    { tag: newTag },
                    { createTag: { tag: newTag }}
                )
                ]);

            const component = setupComponent(wrapper, PublishContainer);
            formData.tags = ['other'];
            fillOutForm(wrapper, formData);

            setInput(wrapper, newTag, 'addTag');

            await submitForm(wrapper);
        });
    });

    describe('#onSubmit', () => {

        it('calls props.createArticle when submit button is clicked', async () => {

            const formData = generateFormData();
            const wrapper = await setup([
                createMutation(
                    ArticleCreate,
                    formData,
                    { createArticle: { issue: casual.randomPositive, url: casual.string}}
                ),
                createQuery(TagQuery, { allTags: Array.from(formData.tags)})
            ]);

            fillOutForm(wrapper, formData);

            await submitForm(wrapper);
        });
    });
});
