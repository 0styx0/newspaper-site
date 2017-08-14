import * as React from 'react';
import { ArticleQuery } from '../../graphql/articles';
import { compose, graphql, withApollo } from 'react-apollo';

import ArticleTable from './';

interface Article {
    tags: {
            all: string;
        };
    url: string;
    id: string;
    displayOrder: number;
    dateCreated: string;
    views: number;
    author: {
        fullName: string;
        profileLink: string;
    };
}

interface Issue {
    num: number;
    max: number;
}

interface Props {
    data: {
        loading: boolean;
        issues?: (
            Issue & {
                articles: Article[]
            }
        )[]; // will never be more length than 1
    };
    client: {
        query: Function;
    };
}

interface State {
    issue: Issue;
    articles: Article[];
}

class ArticleTableContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.putData = this.putData.bind(this);
        this.convertPropsToState = this.convertPropsToState.bind(this);


        this.state = {
            issue: {} as Issue,
            articles: []
        };
    }

    /**
     * @param num - articles from what issue to get. If null, get latest
     *
     * Gets data needed for table (@see State.Article interface) and changes page url to modifyArticles/currentIssue
     *
     * Depends on window.location.pathname
     */
    async putData(num: number | null = null) {

        const lastPath = +window.location.pathname.split('/').slice(-1)[0];

        num = (isNaN(lastPath) || ((!isNaN(+num!)) && num)) ? num : lastPath;

        this.props.client.query({
            query: ArticleQuery,
                variables: {
                    issue: num
            }
        }).then((data: Props) => {
            this.convertPropsToState(data);
        });

        window.history.pushState(
            {},
            `Issue ${num}`, isNaN(lastPath) ?
              `modifyArticles/${num}` :
             num + ''
        );
    }

    componentWillReceiveProps(newProps: Props) {
        this.convertPropsToState(newProps);
    }

    convertPropsToState(props: Props) {

        let {max, num} = props.data.issues![0];

        this.setState({
            issue: {
                max,
                num
            },
            articles: props.data.issues![0].articles
        });

    }

    render() {

        if (this.state.articles.length < 1) {
            return null;
        }

        return (
            <ArticleTable
                articles={this.state.articles}
                key={this.state.issue.num}
                issue={this.state.issue}
                update={(e: Event) => this.putData(+(e.target as HTMLInputElement).value)}
            />
        );
    }
}

const ArticleTableContainerWithData = compose(
    graphql(ArticleQuery, {
        options: {
            variables: {
                issue: +window.location.pathname.split('/').slice(-1)[0]
            }
        }
    }),
)(ArticleTableContainer as any);

export default withApollo(ArticleTableContainerWithData);