import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import { graphql, withApollo } from 'react-apollo';
import { ArticleDelete } from '../../graphql/articles';

import { Link } from 'react-router-dom';


interface Article {
    url: string;
    created: Date;
    tags: {
        all: string
    };
    views: number;
    issue: number;
    id: string;
}

interface User {
    views: number;
    level: number;
    id: string;
    fullName: string;
    profileLink: string;
}

interface UserArticleTableProps {
    articles: Article[];
    user: User;
    deleteArticle: Function;
}

/**
 * Displays table with all articles published by user
 *
 * linkWithName | dateCreated | tags | views | deleteCheckbox (only if own profile)
 */
class UserArticleTable extends React.Component<UserArticleTableProps, {idsToDelete: Set<string>}> {

    private jwt = window.localStorage.getItem('jwt') ?
                JSON.parse(window.localStorage.getItem('jwt') as string)[1] :
                {level: 0};

    constructor() {
        super();

        this.state = {
            idsToDelete: new Set<String>()
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
        const headings: Array<string | JSX.Element> = [
            'Article',
            'Published',
            'Type',
            'Views',
        ];

        if (jwt.email === this.props.user) {

            headings.push(<span className="danger">Delete</span>);
        }

        const articles = this.props.articles.map((article: Article) => {

            const artInfo = [
                (
                    <Link to={`/issue/${article.issue}/story/${article.url}`}>
                        {article.url}
                    </Link>
                ),
                article.created,
                article.tags,
                article.views
            ];

            if (this.jwt.email === this.props.user.profileLink) {
                artInfo.push(
                    <input
                        type="checkbox"
                        name="delArt"
                        onChange={this.onDelete}
                        value={article.id}
                    />
                );
            }
            return artInfo;
        });

        return (
            <Container
                heading="Articles"
                children={
                    <form onSubmit={this.onSubmit}>
                        <Table
                            headings={headings}
                            rows={articles}
                        />

                        {jwt.email === this.props.user ?
                            <div>
                                <Input
                                    label="Password"
                                    props={{
                                        type: 'password',
                                        name: 'password',
                                        required: true,
                                    }}
                                />
                                <input type="submit" />
                            </div>
                        : ''}
                    </form>}
            />
        );
    }
}

const UserArticleTableWithData = compose(
    graphql(ArticleDelete, {name: 'deleteArticle'})
)(UserArticleTable);

export default withApollo(UserArticleTableWithData);