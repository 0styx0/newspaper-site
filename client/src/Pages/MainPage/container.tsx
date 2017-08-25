import * as React from 'react';
import { Article, Issue } from './shared.interfaces';
// import MainPage from './';
import { graphql, compose, withApollo } from 'react-apollo';
import { ArticlePreviewQuery } from '../../graphql/articles';

interface Props {
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
           issue: {} as Issue
        };
    }

    render() {

        return <span />;
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
