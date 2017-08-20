import * as React from 'react';
import Container from '../../../components/Container';
import Input from '../../../components/Form/Input';
import Table from '../../../components/Table';

import ArticleLink from '../../../components/ArticleTable/Link';

export interface Article {
    url: string;
    created: Date;
    tags: {
        all: string
    };
    views: number;
    issue: number;
    id: string;
}

interface Props {
    user: string;
    articles: Article[];
    onSubmit: Function;
    onDelete: Function;
}

/**
 * Displays table with all articles published by user
 *
 * linkWithName | dateCreated | tags | views | deleteCheckbox (only if own profile)
 *
 * @see ./container.tsx
 */
function UserArticleTable(props: Props) {

    const jwt = window.localStorage.getItem('jwt') ?
                JSON.parse(window.localStorage.getItem('jwt') as string)[1] :
                {level: 0};

    const headings: Array<string | JSX.Element> = [
        'Article',
        'Published',
        'Type',
        'Views',
    ];

    if (jwt.email === props.user) {

        headings.push(<span className="danger">Delete</span>);
    }

    const articles = props.articles.map((article: Article) => {

        const artInfo = [
            (
                <ArticleLink
                    url={article.url}
                    issue={article.issue}
                />
            ),
            article.created,
            article.tags,
            article.views
        ];

        if (jwt.email === props.user) {
            artInfo.push(
                <input
                    type="checkbox"
                    name="delArt"
                    onChange={props.onDelete}
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
                <form onSubmit={props.onSubmit}>
                    <Table
                        headings={headings}
                        rows={articles}
                    />

                    {jwt.email === props.user ?
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

export default UserArticleTable;