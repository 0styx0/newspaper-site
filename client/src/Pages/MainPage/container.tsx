import * as React from 'react';
import { Article, Issue } from './shared.interfaces';
import MainPage from './';
import { graphql, compose, withApollo } from 'react-apollo';
import { ArticlePreviewIssueQuery, ArticlePreviewTagQuery } from '../../graphql/articles';
import { IssueInfoQuery } from '../../graphql/issues';

interface Props {
    client: {
        query: Function; // NOTE: the commented out stuff below IS CORRECT but typescript throws error. Not sure why
        //   (( params: { query: typeof ArticlePreviewQuery, variables: { issue?: number; tag?: string} } ) =>
        //     Promise<{ data: Article[] }>)
        //     |
        //   (( params: { query: typeof IssueInfoQuery, variables: { num?: number; } } ) =>
        //     Promise<{ data: [Issue] }>);
    };
    history: {listen: Function};
}

interface State {
    articles: Article[];
    issue: Issue;
}

export class MainPageContainer extends React.Component<Props, State> {

    unlisten: Function;

    constructor(props: Props) {
        super(props);

        this.state = {
           articles: [] as Article[],
            // should only use actual issue stuff (and not articles, rely on state.articles for that)
           issue: {} as Issue
        };
    }

    /**
     * Loads initial data and sets this.unlisten
     */
    async componentWillMount() {

        this.fetchInfo();

        this.unlisten = this.props.history.listen(() => {
            this.fetchInfo();
        });
    }

    componentWillUnmount() {

        this.unlisten();
    }

    /**
     * calls #fetchIssue and #fetchArticles
     */
    fetchInfo() {

        const requested = this.getRequested();

        const issue = Number.isNaN(+requested) ? 0 : +requested;

        // fixes bug where call setState when component is unmounted (due to history.listen)
        if (/^\/($)|(tag\/)|(issue\/\d+?$)/i.test(window.location.pathname)) {
            this.fetchArticles(issue, requested);
            this.fetchIssue(issue);
        }
    }

    /**
     * Get articles from server with issue or tag given by params
     */
    fetchArticles(issue: number, tag: string) {

        let articleQuery: Promise<{ data: { articles: Article[] } }>;

        if (tag === 'Current%20Issue' || !tag || (issue !== 0 && !isNaN(+issue))) {

            articleQuery = this.props.client.query({
                query: ArticlePreviewIssueQuery,
                variables: {
                    issue
                }
            }).then(({ data }: { data: { issues: [Article[]] } }) => ({data: data.issues[0] }));

        } else {

            articleQuery = this.props.client.query({
                query: ArticlePreviewTagQuery,
                variables: {
                    issue,
                    tag
                }
            });
        }

        articleQuery.then(({ data }: { data: { articles: Article[] } }) => {

            this.setState({
                articles: data.articles
            });
        });
    }

    /**
     * Get issue info from server
     */
    fetchIssue(issue?: number) {

        this.props.client.query({
            query: IssueInfoQuery,
            variables: {
                num: issue
            }
        }).then(({ data }: { data: { issues: [Issue] } }) => {

            this.setState({
                issue: data.issues[0]
            });
        });

    }

    /**
     * Gets the tag or issue that user wants to view
     */
    getRequested() {
        return window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
    }

    render() {

        return <MainPage articles={this.state.articles} issue={this.state.issue} />;
    }

}

const MainPageContainerWithData = compose((
    graphql(ArticlePreviewTagQuery, {name: 'articleTagPreviews'}),
    graphql(ArticlePreviewIssueQuery, {name: 'articleIssuePreviews'}),
    graphql(IssueInfoQuery, {name: 'issueInfo'})
))(MainPageContainer);

export default withApollo(MainPageContainerWithData);
