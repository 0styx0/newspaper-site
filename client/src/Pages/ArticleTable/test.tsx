import * as React from 'react';
import { ArticleTableContainer, Article, Issue } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';
import * as casual from 'casual';


localStorageMock.setItem('jwt', JSON.stringify([, {level: 3}])); // only lvl 3 can access this page

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
                all: casual.array_of_words(casual.integer(1, 20))
            },
            url: encodeURIComponent(casual.title),
            id: casual.word,
            displayOrder: casual.integer(0, 100),
            dateCreated: casual.date('YYYY-MM-DD'),
            views: casual.integer(0, 100),
            author: {
                fullName: casual.first_name,
                profileLink: casual.word
            }
        });
    }

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

        beforeAll(() => {

            wrapper = setup();
            component = wrapper.find(ArticleTableContainer).node;

            component.componentWillReceiveProps({data: (casual as any).data() });

            displayOrderInputs = wrapper.find('input[name="displayOrder"]');
        });

        function changeOneInput(value?: number) {

            const oneInput = displayOrderInputs.at(casual.integer(0, displayOrderInputs.length - 1));
            const newValue = (value === undefined) ? casual.integer(0, 100) : value;

            oneInput.node.value = newValue;
            oneInput.simulate('change');

            return oneInput;
        }

        it('allows user to change displayOrder input', () => {

            const newValue = casual.integer(0, 100);

            const oneInput = changeOneInput(newValue);

            expect(+oneInput.node.value).toBe(newValue);
        });

        it('adds article id and displayOrder to state.updates.displayOrder when changes', () => {

            const oneInput = displayOrderInputs.at(casual.integer(0, displayOrderInputs.length - 1));
            const newValue = casual.integer(0, 100);

            oneInput.node.value = newValue;
            oneInput.simulate('change');
        });

        it('updates displayOrder when it has been changed more than once to most recent value', () => {

            //
        });
    });

    describe('tags', () => {

        it('allows users to change tags select', () => {

            //
        });

        it('saves updated tags in state.updates.tags, with article id as the key', () => {

            //
        });

        it('saves the 3 most recently selected tags if user selects more than 3', () => {

            //
        });

        it('removes tags from array if user de-selects', () => {

            //
        });
    });

    describe('delete', () => {

        it('allows users to check the delete checkbox', () => {

            //
        });

        it('saves ids of articles selected for deletion in state.updates.idsToDelete', () => {

            //
        });

        it('removes id from state.updates.idsToDelete if user unchecks the box', () => {

            //
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
