import * as React from 'react';
import { ArticleTableContainer, Article, Issue, Props, State } from './container';
import { MemoryRouter } from 'react-router';
import { mount, ReactWrapper } from 'enzyme';
import renderWithProps from '../../tests/snapshot.helper';
import casual from '../../tests/casual.data';
import snapData from './__snapshots__/articles.example';
import { randomCheckboxToggle, submitForm, setInput, setupComponent } from '../../tests/enzyme.helpers';
import setFakeJwt from '../../tests/jwt.helper';
import { ArticleQuery } from '../../graphql/articles';

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

const filler = async () => (true) as {};

function setup(mockGraphql: {updateArticle?: Function, deleteArticle?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <ArticleTableContainer
                data={customCasual.data()}
                client={{
                    query: async (params: { query: typeof ArticleQuery, variables: { issue: number | null } } ) => (
                        {
                          data: customCasual.data(params.query.variables.issue)
                        }
                    )
                }}
                updateArticle={mockGraphql.updateArticle ? mockGraphql.updateArticle : filler}
                deleteArticle={mockGraphql.deleteArticle ? mockGraphql.deleteArticle : filler}
            />
        </MemoryRouter>
    );
}

describe('<ArticleTableContainer>', () => {

    /**
     * Does the basic setup; gets new versions of wrapper, component and gives component new props
     */
    function setupWithProps(mockGraphql: {updateArticle?: Function, deleteArticle?: Function} = {}) {

        const wrapper = setup(mockGraphql);

        const component = setupComponent(wrapper, ArticleTableContainer);

        return {
            wrapper,
            component,
            data: component.props.data
        };
    }

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
                    } as {} as Props['client']}
                />
            );

            expect(tree).toMatchSnapshot();
        });
    });

    describe('displayOrder', () => {

        /**
         * @param inputIndex - if given, the displayOrder input at that index will be the one changed.
         * If not passed, a random input will be chosen
         */
        function changeOneInput(wrapper: ReactWrapper<Props, State>, inputIndex?: number) {

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
                id: component.state.articles[indexOfInput].id,
                index: indexOfInput
            };
        }

        it('adds article id and displayOrder to state.updates.displayOrder when changes', () => {

            let expected: string[][] = [];
            const { wrapper, component } = setupWithProps();

            for (let i = 0; i < casual.integer(0, 100); i++) {
                const result = changeOneInput(wrapper);

                expected.push([result.id, +result.input.value]);
            }

            // If there are duplicate ids, only get the last one
            // @example [['hi', 1], ['bye', 1], ['hi', 2]] => [['bye', 1], ['hi', 2]]
            const uniqueExpected = expected.filter((elt, i, arr) =>

                !arr.some((search, j) => search[0] === elt[0] && i < j)
            );

            expect([...component.state.updates.displayOrder].sort()).toEqual(uniqueExpected.sort());
        });

        it('updates displayOrder when it has been changed more than once to most recent value', () => {

            const { wrapper } = setupWithProps();
            const input = changeOneInput(wrapper);
            changeOneInput(wrapper, input.index); // changeOneInput has the assertions
        });
    });

    describe('tags', () => {

        /**
         * @param inputIndex - if given, the `select` at that index will be the one changed.
         * @param 2umberOfTags - how many tags to select
         *
         * If either param is not passed, it will be random
         */
        function changeOneSelect(wrapper: ReactWrapper<Props, State>, inputIndex?: number, numberOfTags?: number) {

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

            const { wrapper, component } = setupWithProps();
            const result = changeOneSelect(wrapper);

            expect([...component.state.updates.tags]).toEqual([[result.id, result.value]]);
        });

        it('removes tags from array if user de-selects', () => {

            const { wrapper } = setupWithProps();
            const result = changeOneSelect(wrapper, undefined, 3);

            changeOneSelect(wrapper, result.index, 2); // changeOneSelect does the assertion
        });
    });

    describe('delete', () => {

        /**
         * checks a random `checkbox[name=delete]`
         */
        function changeOneCheckbox(wrapper: ReactWrapper<Props, State>) {

            const component = wrapper.find(ArticleTableContainer).instance();
            const deleteCheckbox = wrapper.find('input[name="delete"]');
            const boxInfo = randomCheckboxToggle(deleteCheckbox);

            const id = component.state.articles[boxInfo.index].id;

            expect(component.state.updates.idsToDelete).toContain(id);

            return {
              index: boxInfo.index,
              input: boxInfo.input,
              id
            };
        }

        it('allows users to check the delete checkbox', () => {
            const { wrapper } = setupWithProps();
            changeOneCheckbox(wrapper); // assertion handled in function
        });

        it('removes id from state.updates.idsToDelete if user unchecks the box', () => {

            const { wrapper, component } = setupWithProps();
            const result = changeOneCheckbox(wrapper);
            (result.input.instance() as {} as HTMLInputElement).checked = false;
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
        function randomArticleLoop(
            wrapper: ReactWrapper<Props, State>, data: { issues: Issues }, func: (article: Article) => void
        ) {

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
                let password = '';

                const { wrapper, component, data} = setupWithProps({
                    // called after submit event (at very bottom of this test)
                    updateArticle: async (info: {variables: {data: typeof tags} }) => {

                         expect(info.variables).toEqual({
                             data: tags,
                             password
                         });
                    }
                });

                randomArticleLoop(wrapper, data, article => {

                    let tagList = getRandomTags();

                    tags.push({id: article.id, tags: [...tagList]});

                    component.state.updates.tags.set(article.id, [...tagList]);
                });

                password = setInput(wrapper);

                submitForm(wrapper);
            });

            test('when only order has changed', () => {

                const orders: updateData[] = [];
                let password = '';

                const { wrapper, component, data } = setupWithProps({
                    // called after submit event (at very bottom of this test)
                    updateArticle: async (info: {variables: {data: typeof orders }}) => {

                         expect(info.variables).toEqual({
                             data: orders,
                             password
                         });
                    }
                });

                randomArticleLoop(wrapper, data, article => {

                    const newOrder = casual.integer(0, 100);

                    orders.push({id: article.id, displayOrder: newOrder});
                    component.state.updates.displayOrder.set(article.id, newOrder);
                });

                password = setInput(wrapper);

                submitForm(wrapper);
            });

            test('displayOrder and tags both refer to same article', () => {

                const allData: updateData[] = [];
                let password = '';

                const { wrapper, component, data } = setupWithProps({

                    updateArticle: async (info: {variables: {data: typeof allData} }) => {

                         expect(info.variables).toEqual({
                             data: allData,
                             password
                         });
                    }
                });

                randomArticleLoop(wrapper, data, article => {

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

                password = setInput(wrapper);

                submitForm(wrapper);
            });

            test('displayOrder and tags refer to different articles', () => {

                const allData: updateData[] = [];
                let password = '';

                const { wrapper, component, data } = setupWithProps({

                    updateArticle: async (info: {variables: {data: typeof allData} }) => {

                        const sortFunc = (a: updateData, b: updateData) => 'tags' in a ? 1 : -1;
                        info.variables.data.sort(sortFunc);
                        allData.sort(sortFunc);

                        expect(info.variables).toEqual({
                            data: allData,
                            password
                        });
                    }
                });

                randomArticleLoop(wrapper, data, article => {

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

                password = setInput(wrapper);

                submitForm(wrapper);
            });
        });

        it('sends idsToDelete in correct format', () => {

            const idsToDelete: string[] = [];
            let password = '';

            const { wrapper, data } = setupWithProps({

                deleteArticle: async (info: {variables: {data: typeof idsToDelete} }) => {

                    expect(info.variables).toEqual({
                        data: idsToDelete,
                        password
                    });
                }
            });

            randomArticleLoop(wrapper, data, article => {
                idsToDelete.push(article.id);
            });

            password = setInput(wrapper);

            submitForm(wrapper);
        });
    });
});
