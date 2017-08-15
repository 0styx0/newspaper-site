import * as React from 'react';
import { ArticleTableContainer, Article, Issue } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../tests/localstorage.mock';
import * as casual from 'casual';

localStorageMock.setItem('jwt', JSON.stringify([,{level: 3}])); // only lvl 3 can access this page

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
    issues: casual.articles(casual.integer(1, 10), issue)
}));

function setup(mockGraphql: {updateArticle?: Function, deleteArticle?: Function} = {}) {

    const filler = () => true;

    return mount(
        <MemoryRouter>
            <ArticleTableContainer
                data={casual.data}
                client={{
                    query: async (query: {variables: {issue: number}}) => (
                      {data: casual.data(query.variables.issue)}
                    )
                }}
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
                    data={casual.data}
                    updateArticle={() => true}
                    deleteArticle={() => true}
                    client={{
                        query: () => true
                    }}
                />
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

});
