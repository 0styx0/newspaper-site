import * as React from 'react';
import { ArticleQuery } from '../../graphql/articles';
import { compose, graphql } from 'react-apollo';

import ArticleTable from './';

interface State {
    issue: number;
}

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
}

class ArticleTableContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.putData = this.putData.bind(this);

        this.state = {
            issue: +window.location.pathname.split('/').slice(-1)[0]
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

        window.history.pushState(
            {},
            `Issue ${num}`, isNaN(lastPath) ?
              `modifyArticles/${num}` :
              num + ''
        );
    }

    componentWillMount() {
    }

    componentWillReceiveProps(newProps: any) {

        window.setTimeout(() => this.setState({
            issue: newProps.data.issues[0].num
        }), 100);
    }

    render() {

        if (!this.props.data.issues) {
            return null;
        }

        return (
            <ArticleTable
                articles={this.props.data.issues![0].articles!}
                key={this.state.issue}
                issue={this.props.data.issues![0]}
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

export default ArticleTableContainerWithData;