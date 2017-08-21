import * as React from 'react';
import { ArticleTableContainer, Article, Issue } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';

import renderWithProps from '../../tests/snapshot.helper';
import casual from '../../tests/casual.data';
import snapData from './__snapshots__/articles.example.ts';

type Issues = (Issue & { articles: Article[] })[];

localStorageMock.setItem('jwt', JSON.stringify([, {level: 3}])); // only lvl 3 can access this page

let allTags = new Set<string>();
casual.define('articles', function(amount: number, issue: number) {

    let articles: Issues = [
        {
            num: issue || casual.integer(1, 50),
            max: casual.integer(50, 100),
            articles: []
        }
    ];

    while (amount-- > 0) {

        articles[0].articles.push({
            tags: casual.tags,
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
    articles[0].articles.forEach(article => article.tags.all.forEach(tag => allTags.add(tag)));

    return articles;
});

casual.define('data', (issue?: number) => ({
    loading: false,
    issues: (casual as any).articles(casual.integer(1, 10), issue) as Issues
}));

const filler = () => (true as any) as any;

function setup(mockGraphql: {updateArticle?: Function, deleteArticle?: Function} = {}) {


    return mount(
        <MemoryRouter>
            <ArticleTableContainer
                data={(casual as any).data()}
                client={{
                    query: async (query: {variables: {issue: number}}) => (
                        {
                          data: (casual as any).data(query.variables.issue)
                        }
                    )
                } as any}
                updateArticle={mockGraphql.updateArticle ? mockGraphql.updateArticle : filler}
                deleteArticle={mockGraphql.deleteArticle ? mockGraphql.deleteArticle : filler}
            />
        </MemoryRouter>
    );
}

describe('<ArticleTableContainer>', () => {

    let wrapper: any;
    let component: any;

    /**
     * Does the basic setup; gets new versions of wrapper, component and gives component new props
     */
    function setupWithProps(mockGraphql: {updateArticle?: Function, deleteArticle?: Function} = {}) {

        wrapper = setup(mockGraphql);
        component = wrapper.find(ArticleTableContainer).node;

        const data = (casual as any).data();

        component.componentWillReceiveProps({ data });

        return data;
    }

    beforeEach(() => {
        wrapper = setup();
    });

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderWithProps(

                <ArticleTableContainer
                    data={{
                        loading: false,
                        issues: snapData
                    }}
                    updateArticle={filler}
                    deleteArticle={filler}
                    client={{
                        query: filler
                    }}
                />
            );

            expect(tree).toMatchSnapshot();
        });
    });

    describe('displayOrder', () => {

        let displayOrderInputs: any;

        beforeEach(() => {

            setupWithProps();
            displayOrderInputs = wrapper.find('input[name="displayOrder"]');
        });

        /**
         * @param inputIndex - if given, the displayOrder input at that index will be the one changed.
         * If not passed, a random input will be chosen
         */
        function changeOneInput(inputIndex?: number) {

            const indexOfInput = (inputIndex === undefined) ?
                casual.integer(0, displayOrderInputs.length - 1) :
                inputIndex;

            const oneInput = displayOrderInputs.at(indexOfInput);
            const newValue = casual.integer(0, 100);

            oneInput.node.value = newValue;
            oneInput.simulate('change');

            expect(+oneInput.node.value).toBe(newValue);

            return {
                input: oneInput,
                id: component.state.articles[indexOfInput].id,
                index: indexOfInput
            };
        }

        it('adds article id and displayOrder to state.updates.displayOrder when changes', () => {

            let expected: string[][] = [];

            for (let i = 0; i < casual.integer(0, 100); i++) {
                const result = changeOneInput();

                expected.push([result.id, +result.input.node.value]);
            }

            // If there are duplicate ids, only get the last one
            // @example [['hi', 1], ['bye', 1], ['hi', 2]] => [['bye', 1], ['hi', 2]]
            const uniqueExpected = expected.filter((elt, i, arr) =>

                !arr.some((search, j) => search[0] === elt[0] && i < j)
            );

            expect([...component.state.updates.displayOrder].sort()).toEqual(uniqueExpected.sort());
        });

        it('updates displayOrder when it has been changed more than once to most recent value', () => {

            const input = changeOneInput();
            changeOneInput(input.index); // changeOneInput has the assertions
        });
    });

    describe('tags', () => {

        let tagSelects: any;

        beforeEach(() => {

            setupWithProps();

            tagSelects = wrapper.find('select[name="tags"]');
        });

        /**
         * @param inputIndex - if given, the `select` at that index will be the one changed.
         * @param numberOfTags - how many tags to select
         *
         * If either param is not passed, it will be random
         */
        function changeOneSelect(inputIndex?: number, numberOfTags?: number) {

            const indexOfInput = (inputIndex === undefined) ?
                casual.integer(0, tagSelects.length - 1) :
                inputIndex;

            const oneInput = tagSelects.at(indexOfInput);

            const newValueSet = new Set<string>();

            for (let i = 0; newValueSet.size < (numberOfTags || casual.integer(1, 3)); i++) {

                newValueSet.add(casual.random_element([...allTags]));
            }

            const newValueArr = [...newValueSet].sort();

            // there must be a better way to select multiple options, but haven't found it
            const selectedOptions = [...oneInput.node.options]
                                    .filter(option => option.selected = newValueArr.indexOf(option.value) !== -1);

            oneInput.simulate('change', {target: {name: 'tags', value: newValueArr, selectedOptions}});

            const id = component.state.articles[indexOfInput].id;

            expect([...component.state.updates.tags]).toContainEqual([id, newValueArr]);

            return {
                input: oneInput,
                id,
                index: indexOfInput,
                value: newValueArr
            };
        }

        it('saves updated tags in state.updates.tags, with article id as the key', () => {

            const result = changeOneSelect();

            expect([...component.state.updates.tags]).toEqual([[result.id, result.value]]);
        });

        it('saves the 3 most recently selected tags if user selects more than 3', () => {


            const result = changeOneSelect();
            const expectedValues: string[] = [];

            const selectedOptions = [...result.input.node.options].map((option: HTMLOptionElement) => {

                expectedValues.push(option.value);
                return option;
            });

            result.input.simulate('change', {target: {name: 'tags', value: expectedValues, selectedOptions}});

            expect([...component.state.updates.tags]).toEqual(
                [[result.id, expectedValues.slice(-3).sort()]]
            );
        });

        it('removes tags from array if user de-selects', () => {

            const result = changeOneSelect(undefined, 3);

            changeOneSelect(result.index, 2); // changeOneSelect does the assertion
        });
    });

    describe('delete', () => {

        let deleteCheckbox: any;

        beforeEach(() => {

            setupWithProps();

            deleteCheckbox = wrapper.find('input[name="delete"]');
        });

        /**
         * checks a random `checkbox[name=delete]`
         */
        function changeOneCheckbox() {

            const checkboxIndex = casual.integer(0, deleteCheckbox.length - 1);

            const oneCheckbox = deleteCheckbox.at(checkboxIndex);
            oneCheckbox.nodes[0].checked = !oneCheckbox.nodes[0].checked;
            oneCheckbox.simulate('change');

            const id = component.state.articles[checkboxIndex].id;

            expect(component.state.updates.idsToDelete).toContain(id);

            return {
              index: checkboxIndex,
              input: oneCheckbox,
              id
            };
        }

        it('allows users to check the delete checkbox', () => {

            changeOneCheckbox(); // assertion handled in function
        });

        it('removes id from state.updates.idsToDelete if user unchecks the box', () => {

            const result = changeOneCheckbox();
            result.input.nodes[0].checked = false;
            result.input.simulate('change');

            expect(component.state.updates.idsToDelete.size).toBe(0);
        });
    });

    describe('#onSubmit', () => {

        /**
         * Loops through a random number of articles and calls @param func on every unique one
         *
         * @param data - casual.data
         * @param func - to be called on every unique article
         */
        function randomArticleLoop(data: {issues: Issues}, func: (article: Article) => void) {

            const numberOfArticles = casual.integer(1, wrapper.find('select[name="tags"]').length);
            const usedIds: string[] = [];

            // put random tags on random articles
            for (let i = 0; i < numberOfArticles; i++) {

                const article: Article = casual.random_element([...data.issues[0].articles]);

                if (usedIds.indexOf(article.id) !== -1) {
                    i--;
                    continue;
                }

                usedIds.push(article.id);

                func(article);
            }
        }

        describe('formats updates correctly when', () => {

            /**
             * @return random amount of tags (between 1 and 3) from @see allTags
             */
            function getRandomTags() {

                let tagList = new Set<string>();
                const allTagsArr = [...allTags];

                for (let j = 0; tagList.size < casual.integer(1, 3); j++) {
                    tagList.add(casual.random_element(allTagsArr));
                }

                return tagList;
            }

            type updateData = {displayOrder?: number, tags?: string[], id: string};

            test('only tags have changed', () => {

                const tags: updateData[] = [];

                const data = setupWithProps({
                    // called after submit event (at very bottom of this test)
                    updateArticle: (info: {variables: {data: typeof tags} }) => {

                         expect(info.variables.data).toEqual(tags);
                    }
                });

                randomArticleLoop(data, article => {

                    let tagList = getRandomTags();

                    tags.push({id: article.id, tags: [...tagList]});

                    component.state.updates.tags.set(article.id, [...tagList]);
                });

                component.onSubmit(new Event('submit'));
            });

            test('when only order has changed', () => {

                const orders: updateData[] = [];

                const data = setupWithProps({
                    // called after submit event (at very bottom of this test)
                    updateArticle: (info: {variables: {data: typeof orders }}) => {

                         expect(info.variables.data).toEqual(orders);
                    }
                });

                randomArticleLoop(data, article => {

                    const newOrder = casual.integer(0, 100);

                    orders.push({id: article.id, displayOrder: newOrder});
                    component.state.updates.displayOrder.set(article.id, newOrder);
                });

                component.onSubmit(new Event('submit'));
            });

            test('displayOrder and tags both refer to same article', () => {

                const allData: updateData[] = [];

                const data = setupWithProps({

                    updateArticle: (info: {variables: {data: typeof allData} }) => {

                         expect(info.variables.data).toEqual(allData);
                    }
                });

                randomArticleLoop(data, article => {

                    const newOrder = casual.integer(0, 100);
                    component.state.updates.displayOrder.set(article.id, newOrder);

                    let tagList = getRandomTags();
                    component.state.updates.tags.set(article.id, [...tagList]);

                    allData.push({
                        id: article.id,
                        tags: [...tagList],
                        displayOrder: newOrder
                    });
                });

                component.onSubmit(new Event('submit'));
            });

            test('displayOrder and tags refer to different articles', () => {

                const allData: updateData[] = [];

                const data = setupWithProps({

                    updateArticle: (info: {variables: {data: typeof allData} }) => {

                        const sortFunc = (a: updateData, b: updateData) => 'tags' in a ? 1 : -1;
                        info.variables.data.sort(sortFunc);
                        allData.sort(sortFunc);

                        expect(info.variables.data).toEqual(allData);
                    }
                });

                randomArticleLoop(data, article => {

                    if (casual.coin_flip) {

                        const newOrder = casual.integer(0, 100);
                        component.state.updates.displayOrder.set(article.id, newOrder);

                        allData.push({
                            id: article.id,
                            displayOrder: newOrder
                        });

                    } else {

                        let tagList = [...getRandomTags()];
                        component.state.updates.tags.set(article.id, tagList);

                        allData.push({
                            id: article.id,
                            tags: tagList
                        });
                    }
                });

                component.onSubmit(new Event('submit'));
            });
        });

        it('sends idsToDelete in correct format', () => {

            const idsToDelete: string[] = [];

            const data = setupWithProps({

                deleteArticle: (info: {variables: {data: typeof idsToDelete} }) => {

                    expect(info.variables.data).toEqual(idsToDelete);
                }
            });

            randomArticleLoop(data, article => {
                idsToDelete.push(article.id);
            });

            component.onSubmit(new Event('submit'));
        });
    });
});
