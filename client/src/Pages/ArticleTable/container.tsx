import * as React from 'react';
import { ArticleQuery, ArticleUpdate, ArticleDelete } from '../../graphql/articles';
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
    updateArticle: Function;
    deleteArticle: Function;
}

interface State {
    issue: Issue;
    articles: Article[];
    updates: {
        idsToDelete: Set<string>;
        displayOrder: Map<string, number>; // id => info
        tags: Map<string, string[]>;
    };
}

class ArticleTableContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.putData = this.putData.bind(this);
        this.convertPropsToState = this.convertPropsToState.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);



        this.state = {
            issue: {} as Issue,
            articles: [],
            updates: {
                idsToDelete: new Set<string>(),
                displayOrder: new Map<string, number>(),
                tags: new Map<string, string[]>()
            }
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

        if (!props.data.issues) {
            return;
        }

        let {max, num} = props.data.issues![0];

        this.setState({
            issue: {
                max,
                num
            },
            articles: props.data.issues![0].articles
        });

    }

    /**
     * Saves changes to articles so can be submitted later on
     */
    onChange(e: Event, article: Article) {

        e.stopPropagation();
        e.preventDefault();

        const target = e.target as HTMLInputElement | HTMLSelectElement; // or `select`

        const stateUpdate = this.state.updates;

        const modifyMapCopy = new Map(stateUpdate[target.name]);
        let value: number | string[];

        if ((target as HTMLSelectElement).selectedOptions) {

            value = Array.from((target as HTMLSelectElement).selectedOptions).map(option => option.value);
        } else {
            value = +target.value;
        }

        modifyMapCopy.set(article.id, value);

        stateUpdate[target.name] = modifyMapCopy;

        this.setState({
            updates: stateUpdate
        });
    }

    onDelete(e: Event) {

        const stateUpdate = this.state.updates;

        const target = e.target as HTMLInputElement;

        target.checked ? stateUpdate.idsToDelete.add(target.value) : stateUpdate.idsToDelete.delete(target.value);

        this.setState({
            updates: stateUpdate
        });
    }

    onSubmit(e: Event) {

        e.stopPropagation();
        e.preventDefault();

        // separating update and delete into functions just to show they're separate stuff
        const submitUpdated = () => {

            const { displayOrder, tags } = this.state.updates;

            let data: {id: string, displayOrder?: number, tags?: string[]}[] = [...displayOrder].map(mapping => ({

                id: mapping[0],
                displayOrder: mapping[1]
            }));

            [...tags].forEach(mapping => {

                const idIdx = data.findIndex(elt => elt.id === mapping[0]);

                if (idIdx !== -1) {
                    data[idIdx].tags = mapping[1];
                } else {
                    data.push({
                        id: mapping[0],
                        tags: mapping[1]
                    });
                }
            });

            this.props.updateArticle({
                variables: {
                    data
                }
            });
        };

        const submitDeleted = () => {

            this.props.deleteArticle({
                variables: {
                    ids: [...this.state.updates.idsToDelete]
                }
            });
        };

        submitUpdated();
        submitDeleted();
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
                onChange={this.onChange}
                onDelete={this.onDelete}
                onUpdate={(e: Event) => this.putData(+(e.target as HTMLInputElement).value)}
                onSubmit={this.onSubmit}
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
    graphql(ArticleUpdate, {name: 'updateArticle'}),
    graphql(ArticleDelete, {name: 'deleteArticle'})
)(ArticleTableContainer as any);

export default withApollo(ArticleTableContainerWithData);