import * as React from 'react';
import { graphql, withApollo, compose } from 'react-apollo';
import { ArticleDelete } from '../../../graphql/articles';
import { Article } from '../shared.interfaces';
import UserArticleTable from './';

interface Props {
    articles: Article[];
    canModify: boolean;
    deleteArticle: Function;
}

/**
 * Container for @see ./index.tsx
 */
class UserArticleTableContainer extends React.Component<Props, {idsToDelete: Set<string>}> {

    constructor() {
        super();

        this.state = {
            idsToDelete: new Set<string>()
        };
    }

    /**
     * Adds an article to state.idsToDelete
     */
    onDelete(e: Event) {

        const idsToDelete: Set<string> = this.state.idsToDelete;

        idsToDelete.add((e.target as HTMLInputElement).value);

        this.setState({
            idsToDelete
        });
    }

    /**
     * Sends idsToDelete to server to be deleted
     */
    onSubmit() {

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
              canModify={this.props.canModify}
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