import * as React from 'react';

import Container from '../../components/Container';
import Table from '../../components/Table';
import Input from '../../components/Form/Input';
import TagSelect from '../../components/TagSelect';

import { Article, Issue } from './container';

import ArticleLink from '../../components/ArticleTable/Link';
import AuthorLink from '../../components/User/Link';

interface Props {
    issue: Issue;
    articles: Article[];
    onUpdate: Function;
    onSubmit: Function;
    onChange: (e: any, article: Article) => void;
    onDelete: Function;
}

/**
 * @summary Creates table with info about all articles in issue `props.issue.num`
 *
 * @description Has an `input` where user can choose which issue to view,
 * a table with actual info, and `password` and `submit` `input`s to save changes
 *
 * @see createArticleTableRows for info about what's in the table
 */
export default function ArticleTable(props: Props) {

    const headings = [
        'Article',
        'Date Created',
        'Uploaded By',
        'Type',
        'Views',
        'Display Order',
        <span key="random_key" className="danger">Delete</span>
    ];

    const rows = createArticleTableRows(props);

    return (
        <Container
            heading="Articles"
            className="tableContainer"
            children={
                <div>
                    <Input
                        label="Issue Number"
                        props={{
                        type: 'number',
                        min: 1,
                        defaultValue: props.issue.num || '',
                        max: props.issue.max,
                        onChange: props.onUpdate
                        }}
                    />
                    <form onSubmit={props.onSubmit as any}>
                        <Table headings={headings} rows={rows}/>

                        <Input
                            label="Password"
                            props={{
                                type: 'password',
                                name: 'password',
                                required: true
                            }}
                        />
                        <input type="submit" value="Modify" />
                    </form>
                </div>
            }
        />
    );
}

/**
 * Generates table rows in the following format
 *
 *  linkToArticle | dateArticleWasCreated | linkToAuthorProfile | `select` where can change tags of article |
 *  views | displayOrder | `checkbox` for deletion
 *
 */
function createArticleTableRows(props: Props) {

    if (!props.articles) {
        return [[]];
    }

    // any extra tags that aren't hardcoded into #TagSelect will be included
    // doing this mainly for unit tests, when randomly generating tags
    const allTags = new Set<string>();
    props.articles.forEach(article => article.tags.all.forEach(tag => allTags.add(tag)));

    return props.articles.map((article: Article) => {

            return [
                <ArticleLink key={article.url} issue={props.issue.num} url={article.url} />,
                article.dateCreated,
                (
                    <AuthorLink
                      key={article.author.fullName}
                      fullName={article.author.fullName}
                      profileLink={article.author.profileLink}
                    />
                ),
                (
                    <TagSelect
                        tags={[...allTags]}
                        props={{
                            name: 'tags',
                            onChange: (e: any) => props.onChange(e, article),
                            multiple: true,
                            defaultValue: article.tags.all,
                            required: true,
                        }}
                    />
                ),
                article.views,
                // Same info in SecretTwins as right above so that artId is submitted no matter what
                (
                    <input
                      type="number"
                      onChange={(e) => props.onChange(e, article) as any}
                      name="displayOrder"
                      defaultValue={`${article.displayOrder}`}
                    />
                ),
                (
                    <input
                      key={article.id}
                      onChange={props.onDelete as any}
                      type="checkbox"
                      name="delete"
                      value={article.id}
                    />
                )
            ];
    });
}