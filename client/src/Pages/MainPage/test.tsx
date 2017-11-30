import * as React from 'react';
import { MainPageContainer } from './container';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import casual from '../../tests/casual.data';
import { Article, Issue } from './shared.interfaces';
import * as sinon from 'sinon';
import createHistory from 'history/createBrowserHistory';
import { mount } from 'enzyme';




const history = createHistory();

Object.defineProperty(window.location, 'pathname', { // so can change path
    writable: true,
    value: '/issue/4'
});

const customCasual = casual as typeof casual & {
    articles: Article[],
    issue: Issue,
    previewIssueData: { data: { issues: { articles: Article[] }[] } },
    previewTagData: { data: { articles: Article[] }}
};

customCasual.define('issue', (): Issue => ({
    max: casual.integer(50, 100), // random numbers, just make sure max is greater than num
    num: casual.integer(1, 100),
    name: casual.title
}));

customCasual.define('articles', (): Article[] => {

   let amount = casual.randomPositive;
   const articles: Article[] = [];

   while (amount-- > 0) {

       articles.push({
            url: casual.articleUrl + '--' + amount,
            issue: casual.randomPositive,
            images: Array(casual.randomPositive).fill(null).map(() => ({
                url: casual.url
            })),
            displayOrder: casual.randomPositive,
            views: casual.randomPositive,
            lede: casual.text
       });
   }

   return articles;
});

customCasual.define('previewIssueData', () => ({
    data: {
        issues: [{
            articles: customCasual.articles
        }]
    }
}));

customCasual.define('previewTagData', () => ({
    data: {
        articles: customCasual.articles
    }
}));

/**
 * @return object of stubs that can/will be called from MainPageContainer
 */
function getQueryStubs() {

    const tagStub = sinon.stub().returns(customCasual.previewTagData);
    const issueStub = sinon.stub().returns(customCasual.previewIssueData);
    const numStub = sinon.stub().returns({
        data: {
            issues: [customCasual.issue]
        }
    });

    const stub = sinon.stub().returns(async (params: { variables: { tag: string }}) => {

        if ('tag' in params.variables) {
            return tagStub();
        }

        if ('issue' in params.variables) {
            return issueStub();
        }

        return numStub();
    });

    return {
        tagStub,
        issueStub,
        numStub,
        stub
    };
}

/**
 * Changes window.location.pathname and calls history.listen
 */
function changeHistory(to: string) {

    window.location.pathname = `/${to}`;
    history.push(`/${to}`);
}

describe('<MainPageContainer>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const tree = renderer.create(

                <MemoryRouter>
                    <MainPageContainer
                        client={{
                            query: getQueryStubs().stub()
                        }}
                        history={history}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });

    describe('querying', () => {

        function setup(query = getQueryStubs().stub()) {

            return mount(
                <MemoryRouter>
                    <MainPageContainer
                        client={{
                            query
                        }}
                        history={history}
                    />
                </MemoryRouter>
            );
        }

        it('is called when component is mounted', () => {

            const stubs = getQueryStubs();

            setup(stubs.stub());

            expect(stubs.stub.called).toBeTruthy();
            expect(stubs.issueStub.called).toBeTruthy();
        });

        it('is called when history is changed', () => {

            const stubs = getQueryStubs();
            const tag = casual.word;

            setup(stubs.stub());

            expect(stubs.tagStub.called).toBeFalsy();

            changeHistory(`tag/${tag}`);

            expect(stubs.tagStub.called).toBeTruthy();
        });

        describe('calls correct method when getting articles', () => {

            it('in an tag', () => {

                const stubs = getQueryStubs();

                changeHistory(`tag/${casual.word}`);

                setup(stubs.stub());

                expect(stubs.tagStub.called).toBeTruthy();
                expect(stubs.numStub.called).toBeTruthy();
                expect(stubs.issueStub.called).toBeFalsy();
            });

            it('from a issue', () => {

                const stubs = getQueryStubs();

                changeHistory(`issue/${casual.randomPositive.toString()}`);

                setup(stubs.stub());

                expect(stubs.numStub.called).toBeTruthy();
                expect(stubs.issueStub.called).toBeTruthy();
                expect(stubs.tagStub.called).toBeFalsy();
            });
        });
    });
});
