import * as React from 'react';
import { graphql, withApollo, compose } from 'react-apollo';
import { ArticleDelete } from '../../../graphql/articles';
import { Article } from '../shared.interfaces';
import UserArticleTable from './';

interface Props {
    articles: Article[];
    deleteArticle: Function;
}

/**
 * Container for @see ./index.tsx
 */
export class UserArticleTableContainer extends React.Component<Props, {idsToDelete: Set<string>}> {

    constructor() {
        super();

        this.onDelete = this.onDelete.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            idsToDelete: new Set<string>()
        };
    }

    /**
     * Adds an article to state.idsToDelete
     */
    onDelete(e: Event) {

        const idsToDelete: Set<string> = this.state.idsToDelete;
        const value = (e.target as HTMLInputElement).value;

        if (idsToDelete.has(value)) {

            idsToDelete.delete(value);
        } else {

            idsToDelete.add(value);
        }

        this.setState({
            idsToDelete
        });
    }

    /**
     * Sends idsToDelete to server to be deleted
     */
    onSubmit(e: Event) {

        e.preventDefault();
        e.stopPropagation();

        this.props.deleteArticle({
            variables: {
                ids: [...this.state.idsToDelete]
            }
        });
    }

    render() {

        return (
            <UserArticleTable
              articles={this.props.articles}
              onDelete={this.onDelete}
              onSubmit={this.onSubmit}
            />
        );
    }
}


const UserArticleTableContainerWithData = compose(
    graphql(ArticleDelete, {name: 'deleteArticle'})
)(UserArticleTableContainer as any);

export default withApollo(UserArticleTableContainerWithData);