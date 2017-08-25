import * as React from 'react';
import { Article, Issue } from './shared.interfaces';
import MainPage from './';
import { graphql, compose, withApollo } from 'react-apollo';
import { ArticlePreviewQuery } from '../../graphql/articles';

interface Props {
    data: {
        issues: ({
            articles: Article[];
        } & Issue)[];
    };
    client: {
        query:
          ( params: { query: typeof ArticlePreviewQuery, variables: { issue: string | number; } } ) => Promise<Props>;
    };
}

interface State {
    articles: Article[];
    issue: Issue;
}

class MainPageContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.state = {
           articles: [] as Article[],
            // should only use actual issue stuff (and not articles, rely on state.articles for that)
           issue: {} as Issue
        };
    }

    /**
     * Get data from server after initial load (if rely only on the initial query
     * at bottom of this file, will get same info no matter whose profile is being looked at)
     */
    async componentWillMount() {

        const { data } = await this.props.client.query({
            query: ArticlePreviewQuery,
            variables: {
                issue: this.getIssueRequested()
            }
        });

        this.setState({
           articles: data.issues[0].articles,
            // should only use actual issue stuff (and not articles, rely on state.articles for that)
           issue: data.issues[0]
        });
    }

    /**
     * Gets the link to whoever's profile is currently being viewed
     */
    getIssueRequested() {
        return +window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
    }

    render() {

        return <MainPage articles={this.state.articles} issue={this.state.issue} />;
    }

}

const MainPageContainerWithData = compose(
    graphql(ArticlePreviewQuery, {
        options: {
            variables: {
                issue: +window.location.pathname.split('/')[window.location.pathname.split('/').length - 1]
            }
        }
    } as any) as any
)(MainPageContainer);

export default withApollo(MainPageContainerWithData);
