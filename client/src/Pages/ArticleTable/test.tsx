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
            num: issue || casual.integer(1, 100),
            max: casual.integer(1, 100),
            articles: []
        }
    ];

    while (amount-- > 0) {

        articles[0].articles.push({
            tags: {
                all: casual.word
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
                data={(casual as any).data as any}
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

    beforeEach(() => {
        wrapper = setup();
    });

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(

                <ArticleTableContainer
                    data={(casual as any).data}
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

        it('allows user to change displayOrder input', () => {

            //
        });

        it('adds article id and displayOrder to state.updates.displayOrder when changes', () => {

            //
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
});
