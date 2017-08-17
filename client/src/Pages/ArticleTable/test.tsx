import * as React from 'react';
import { ArticleTableContainer, Article, Issue } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';
import * as casual from 'casual';


localStorageMock.setItem('jwt', JSON.stringify([, {level: 3}])); // only lvl 3 can access this page

let allTags = new Set<string>();
casual.define('articles', function(amount: number, issue: number) {

    let articles: (Issue & { articles: Article[] })[] = [
        {
            num: issue || casual.integer(1, 50),
            max: casual.integer(50, 100),
            articles: []
        }
    ];

    while (amount-- > 0) {

        articles[0].articles.push({
            tags: {
                all: casual.array_of_words(casual.integer(1, 3)) // can have at most 3 tags, at least 1
            },
            url: encodeURIComponent(casual.title),
            id: casual.word + '--' + amount,
            displayOrder: casual.integer(0, 100),
            dateCreated: casual.date('YYYY-MM-DD'),
            views: casual.integer(0, 100),
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
    issues: (casual as any).articles(casual.integer(1, 10), issue) as (Issue & { articles: Article[] })[]
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

    beforeEach(() => {
        wrapper = setup();
    });

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(

                <ArticleTableContainer
                    data={(casual as any).data()}
                    updateArticle={filler}
                    deleteArticle={filler}
                    client={{
                        query: filler
                    }}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('displayOrder', () => {

        let displayOrderInputs: any;

        beforeEach(() => {

            wrapper = setup();
            component = wrapper.find(ArticleTableContainer).node;

            component.componentWillReceiveProps({data: (casual as any).data() });

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

            wrapper = setup();
            component = wrapper.find(ArticleTableContainer).node;

            component.componentWillReceiveProps({data: (casual as any).data() });

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

            wrapper = setup();
            component = wrapper.find(ArticleTableContainer).node;

            component.componentWillReceiveProps({data: (casual as any).data() });

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

        describe('formats updates correctly when', () => {

            test('only tags have changed', () => {

                //
            });

            test('when only order has changed', () => {

                //
            });

            test('displayOrder and tags both refer to same article', () => {

                //
            });

            test('displayOrder and tags refer to different articles', () => {

                //
            });
        });

        it('sends idsToDelete in correct format', () => {

            //
        });
    });
});
