import * as React from 'react';
import { UserArticleTableContainer } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../../tests/localstorage.mock';
import casual from '../../../tests/casual.data';
import snapData from './articles.example';
import { Article } from '../shared.interfaces';

localStorageMock.setItem('jwt', JSON.stringify([,{level: 3}]));

interface customCasualData {
    articles: (amount: number) => Article[];
}

type customCasual = customCasualData & typeof casual;

const customCasual = casual as customCasual;

casual.define('articles', function(amount: number) {

    const articles: Article[] = [];

    while (amount-- > 0) {

        articles.push({
            tags: casual.tags,
            url: casual.articleUrl,
            id: casual.word + '--' + amount,
            dateCreated: casual.dateCreated,
            views: casual.randomPositive,
            issue: casual.randomPositive
        });
    }

    return articles;
});

function setup(mockGraphql: {deleteArticle?: Function} = {}) {

    return mount(
        <MemoryRouter>
            <UserArticleTableContainer
                articles={customCasual.articles(casual.randomPositive)}
                deleteArticle={mockGraphql.deleteArticle ? mockGraphql.deleteArticle : (test: {}) => false}
                canModify={!!casual.coin_flip}
            />
        </MemoryRouter>
    );
}

describe('<UserArticleTableContainer>', () => {
    let wrapper: any;

    beforeEach(() => {
        wrapper = setup();
    });

    describe('snapshots', () => {

        function testSnap(canModify: boolean) {

            const tree = renderer.create(

                <MemoryRouter>
                    <UserArticleTableContainer
                        articles={snapData}
                        deleteArticle={(test: {}) => false}
                        canModify={canModify}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();

        }

        it('renders correctly when canModify is true', () => testSnap(true));

        it('renders correctly when canModify is false', () => testSnap(false));
    });
});
