import * as React from 'react';
import Container from '../../../components/Container';
import Input from '../../../components/Form/Input';
import Table from '../../../components/Table';
import { Article } from '../shared.interfaces';
import ArticleLink from '../../../components/ArticleTable/Link';

interface Props {
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


    const headings: Array<string | JSX.Element> = [
        'Article',
        'Published',
        'Type',
        'Views',
    ];

    if (props.articles[0].canEdit) { // if can edit one, assume can edit all. If this changes just use .every

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
            article.dateCreated,
            article.tags.all.join(', '),
            article.views
        ];

        if (article.canEdit) {
            artInfo.push(
                <input
                    type="checkbox"
                    name="delArt"
                    onChange={props.onDelete as any}
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
                <form onSubmit={props.onSubmit as any}>
                    <Table
                        headings={headings}
                        rows={articles}
                    />

                    {props.articles[0].canEdit ?
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