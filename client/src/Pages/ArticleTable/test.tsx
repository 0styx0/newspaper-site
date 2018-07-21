import * as React from 'react';
import ArticleApolloContainer, { ArticleTableContainer, Article, Issue, State } from './container';
import { ReactWrapper } from 'enzyme';
import casual from '../../tests/casual.data';
import snapData from './__snapshots__/articles.example';
import { randomCheckboxToggle, submitForm, setInput, setupComponent } from '../../tests/enzyme.helpers';
import setFakeJwt from '../../tests/jwt.helper';
import { ArticleQuery, ArticleUpdate, ArticleDelete } from '../../graphql/articles';
import mockGraphql, { createMutation, mountWithGraphql } from '../../tests/graphql.helper';
import { renderWithGraphql } from '../../tests/snapshot.helper';
import { createQuery } from '../../tests/graphql.helper';
import * as sinon from 'sinon';
type Issues = (Issue & { articles: Article[] })[];

setFakeJwt({level: 3}); // only lvl 3 can access this page

let allTags = new Set<string>();

function generateArticles(amount: number, issue: number = casual.integer(1, 20)) {

    let articles: Issues = [
        {
            num: issue,
            max: casual.integer(50, 100),
            articles: []
        }
    ];

    while (amount-- > 0) {

        const tags = casual.tags;

        articles[0].articles.push({
            tags,
            url: casual.articleUrl,
            id: casual.word + '--' + amount,
            displayOrder: casual.integer(0, 100),
            dateCreated: casual.dateCreated,
            views: casual.randomPositive,
            author: {
                fullName: casual.first_name,
                profileLink: casual.word
            }
        });
    }

    allTags.clear();
    articles[0].articles.forEach(article => article.tags.forEach(tag => allTags.add(tag)));

    return articles;
}
casual.define('articles', generateArticles);

const customCasual = casual as typeof casual & { articles: typeof generateArticles, data: typeof generateData };

function generateData(issue?: number) {

    return {
        loading: false,
        issues: customCasual.articles(casual.integer(1, 10), issue) as Issues
    };
}

casual.define('data', generateData);

async function setup(graphql: any[] = [
        createQuery(ArticleUpdate, customCasual.data(0)),
        createQuery(ArticleDelete, customCasual.data(0)),
        createMutation(ArticleQuery, { issue: 0 }, customCasual.data(0) ),
    ]) {

    return await mountWithGraphql(graphql, <ArticleApolloContainer />) as ReactWrapper<any, Readonly<{}>>;
}

describe('<ArticleTableContainer>', async () => {

    /**
     * Does the basic setup; gets new versions of wrapper, component and gives component new props
     */
    async function setupWithProps(graphql?: any[]) {

        const wrapper = await setup(graphql);

        const component = setupComponent(wrapper, ArticleTableContainer);

        return {
            wrapper,
            component,
            data: component.props.data
        };
    }

    describe('snapshots', async () => {

        it('renders correctly', async () => {

            await renderWithGraphql(
                mockGraphql(
                    [
                        createMutation(ArticleQuery, { issue: 0 }, { issues: snapData }),
                        createQuery(ArticleUpdate, customCasual.data(0)),
                        createQuery(ArticleDelete, customCasual.data(0))
                    ],
                    <ArticleApolloContainer />
                )
            );
        });
    });

    describe('displayOrder', async () => {

        /**
         * @param inputIndex - if given, the displayOrder input at that index will be the one changed.
         * If not passed, a random input will be chosen
         */
        function changeOneOrderInput(
            wrapper: ReactWrapper<any, Readonly<{}>>,
            inputIndex?: number
        ) {

            const displayOrderInputs = wrapper.find('input[name="displayOrder"]');

            const component = wrapper.find(ArticleTableContainer).instance();

            const indexOfInput = (inputIndex === undefined) ?
                casual.integer(0, displayOrderInputs.length - 1) :
                inputIndex;

            const oneInput = displayOrderInputs.at(indexOfInput);
            const newValue = casual.integer(0, 100);
            const inputInstance = oneInput.instance() as {} as HTMLInputElement;

            inputInstance.value = newValue.toString();
            oneInput.simulate('change', { target: { value: newValue, name: 'displayOrder'} });

            expect(+inputInstance.value).toBe(newValue);

            return {
                input: inputInstance,
                id: ((component.state as State) as State).articles[indexOfInput].id,
                index: indexOfInput
            };
        }

        it('adds article id and displayOrder to state.updates.displayOrder when changes', async () => {

            let expected: React.ReactText[][] = [];
            const { wrapper, component } = await setupWithProps();

            for (let i = 0; i < casual.integer(0, 100); i++) {
                const result = changeOneOrderInput(wrapper);

                expected.push([result.id, +result.input.value]);
            }

            // If there are duplicate ids, only get the last one
            // @example [['hi', 1], ['bye', 1], ['hi', 2]] => [['bye', 1], ['hi', 2]]
            const uniqueExpected = expected.filter((elt, i, arr) =>

                !arr.some((search, j) => search[0] === elt[0] && i < j)
            );

            expect([...(component.state as State).updates.displayOrder].sort()).toEqual(uniqueExpected.sort());
        });

        it('updates displayOrder when it has been changed more than once to most recent value', async () => {

            const { wrapper } = await setupWithProps();
            const input = changeOneOrderInput(wrapper);
            changeOneOrderInput(wrapper, input.index); // changeOneInput has the assertions
        });
    });

    describe('tags', async () => {

        /**
         * @param inputIndex - if given, the `select` at that index will be the one changed.
         * @param 2umberOfTags - how many tags to select
         *
         * If either param is not passed, it will be random
         */
        function changeOneSelect(
            wrapper: ReactWrapper<any, Readonly<{}>>,
            inputIndex?: number,
            numberOfTags?: number
        ) {

            const tagSelects = wrapper.find('select[name="tags"]');
            const indexOfInput = (inputIndex === undefined) ?
                casual.integer(0, tagSelects.length - 1) :
                inputIndex;

            const oneInput = tagSelects.at(indexOfInput);
            const component = wrapper.find(ArticleTableContainer).instance();
            const newValueSet = new Set<string>();

            for (let i = 0; newValueSet.size < casual.integer(1, numberOfTags); i++) {

                newValueSet.add(casual.random_element([...allTags]));
            }

            const newValueArr = [...newValueSet].sort();

            // there must be a better way to select multiple options, but haven't found it
            const selectedOptions = oneInput.find('option')
                .reduce((accum, option) => {

                    const optionInstance = option.instance() as {} as HTMLOptionElement;

                    optionInstance.selected = newValueArr.indexOf(optionInstance.value) !== -1;
                    return optionInstance.selected ? accum.concat([optionInstance]) : accum;
                },      [] as HTMLOptionElement[]);

            oneInput.simulate('change', {target: {name: 'tags', value: newValueArr, selectedOptions}});

            const id = (component.state as State).articles[indexOfInput].id;

            expect([...(component.state as State).updates.tags]).toContainEqual([id, newValueArr]);

            return {
                input: oneInput,
                id,
                index: indexOfInput,
                value: newValueArr
            };
        }

        it('saves updated tags in state.updates.tags, with article id as the key', async () => {

            const { wrapper, component } = await setupWithProps();
            const result = changeOneSelect(wrapper);

            expect([...(component.state as State).updates.tags]).toEqual([[result.id, result.value]]);
        });

        it('removes tags from array if user de-selects', async () => {

            const { wrapper } = await setupWithProps();
            const result = changeOneSelect(wrapper, undefined, 3);

            changeOneSelect(wrapper, result.index, 2); // changeOneSelect does the assertion
        });
    });

    describe('delete', async () => {

        /**
         * checks a random `checkbox[name=delete]`
         */
        function changeOneCheckbox(wrapper: ReactWrapper<any, Readonly<{}>>) {

            const component = wrapper.find(ArticleTableContainer).instance();
            const deleteCheckbox = wrapper.find('input[name="delete"]');
            const boxInfo = randomCheckboxToggle(deleteCheckbox);

            const id = (component.state as State).articles[boxInfo.index].id;

            expect((component.state as State).updates.idsToDelete).toContain(id);

            return {
              index: boxInfo.index,
              input: boxInfo.input,
              id
            };
        }

        it('allows users to check the delete checkbox', async () => {
            const { wrapper } = await setupWithProps();
            changeOneCheckbox(wrapper); // assertion handled in function
        });

        it('removes id from state.updates.idsToDelete if user unchecks the box', async () => {

            const { wrapper, component } = await setupWithProps();
            const result = changeOneCheckbox(wrapper);
            (result.input.instance() as {} as HTMLInputElement).checked = false;
            result.input.simulate('change');

            expect((component.state as State).updates.idsToDelete.size).toBe(0);
        });
    });

    describe('#onSubmit', () => {

        describe('formats updates correctly when', async () => {

            type updateData = {displayOrder?: number, tags?: string[], id: string};

            async function setupUpdate(data: updateData[]) {

                const password = casual.password;

                const setupData = await setupWithProps([
                    createMutation(
                        ArticleUpdate,
                        { data, password },
                        { updateArticles: customCasual.data(0).issues[0].articles }
                    ),
                    createQuery(ArticleDelete, customCasual.data(0)),
                    createMutation(ArticleQuery, { issue: 0 }, customCasual.data(0))
                ]);

                setInput(setupData.wrapper, password);

                return setupData;
            }

            // no assertion, but if graphql doesn't match what's in setupWithProps, error thrown
            test('only tags have changed', async() => {

                const tags: updateData[] = customCasual.articles(customCasual.randomPositive)[0]
                    .articles.map(article => (
                        { id: article.id, tags: article.tags }
                    )
                );

                const { component, wrapper } = await setupUpdate(tags);

                tags.forEach(tag => (component.state as State).updates.tags.set(tag.id, tag.tags!));

                await submitForm(wrapper);
            });

            test('when only order has changed', async () => {

                const data: updateData[] = customCasual.articles(customCasual.randomPositive)[0]
                    .articles.map(article => (
                        { id: article.id, displayOrder: article.displayOrder }
                    )
                    );

                const { component, wrapper } = await setupUpdate(data);

                data.forEach(dit =>
                    (component.state as State).updates.displayOrder.set(dit.id, dit.displayOrder!));
                await submitForm(wrapper);
            });

            test('displayOrder and tags both refer to same article', async () => {

                const data: updateData[] = customCasual.articles(customCasual.randomPositive)[0]
                    .articles.map(article => (
                        { id: article.id, displayOrder: article.displayOrder, tags: article.tags }
                    )
                );

                const { wrapper } = await setupUpdate(data);

                await submitForm(wrapper);
            });

            test('displayOrder and tags refer to different articles', async () => {

                const data: updateData[] = customCasual.articles(customCasual.randomPositive)[0]
                    .articles.map(article => (
                        casual.coin_flip ?
                          { id: article.id, displayOrder: article.displayOrder } :
                          { id: article.id, tags: article.tags }
                    )
                );

                const { wrapper } = await setupUpdate(data);

                await submitForm(wrapper);
            });
        });

        describe(`deletion`, () => {

            async function setupDeletion(data: string[]) {

                const password = casual.password;

                const setupData = await setupWithProps([
                    createQuery(ArticleDelete, data),
                    createMutation(ArticleQuery, { issue: 0 }, customCasual.data(0))
                ]);

                setInput(setupData.wrapper, password);

                return setupData;
            }

            it('sends idsToDelete in correct format', async () => {

                const spy = sinon.spy(ArticleTableContainer.prototype, 'onSubmit');
                const data = customCasual.articles(customCasual.randomPositive)[0]
                    .articles.map(article => article.id);

                const { wrapper } = await setupDeletion(data);
                await submitForm(wrapper);
                expect(spy.calledOnce).toBeTruthy();
                (ArticleTableContainer.prototype.onSubmit as any).restore();
            });
        });
    });
});
