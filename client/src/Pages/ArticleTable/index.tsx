import * as React from 'react';

import Container from '../../components/Container';
import Table from '../../components/Table';
import Input from '../../components/Form/Input';
import FormContainer from '../../components/Form/container';
import TagSelect from '../../components/TagSelect';

import { Article, Issue } from './container';

import ArticleLink from '../../components/ArticleTable/Link';
import AuthorLink from '../../components/User/Link';
import { ChangeEvent } from 'react';
import { Helmet } from 'react-helmet';

interface Props {
    issue: Issue;
    articles: Article[];
    onUpdate: Function;
    onSubmit: Function;
    onChange: (e: ChangeEvent<HTMLSelectElement | HTMLInputElement>, article: Article) => void;
    onDelete: (e: ChangeEvent<HTMLInputElement>) => void;
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
       <Container heading="Articles" className="tableContainer">

            <Helmet>
                <title>{`Issue #${props.issue.num} articles`}</title>
                <meta
                    name="description"
                    content={`Table of articles in issue ${props.issue.num}`}
                />
            </Helmet>

            <Input
                label="Issue Number"
                key="issueChooser"
                props={{
                type: 'number',
                min: 1,
                defaultValue: props.issue.num || '',
                max: props.issue.max,
                onChange: props.onUpdate,
                name: 'issueNumber'
                }}
            />
            <FormContainer onSubmit={props.onSubmit}>

                <Table key="table" headings={headings} rows={rows}/>

                <Input
                    key="password"
                    label="Password"
                    props={{
                        type: 'password',
                        name: 'password',
                        required: true
                    }}
                />
                <input key="submit" type="submit" value="Modify" />
            </FormContainer>
        </Container>
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
    /** @deprecated since TagSelect now queries tags from database */
    const allTags = new Set<string>();
    props.articles.forEach(article => article.tags.forEach(tag => allTags.add(tag)));

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
                            onChange: (e: ChangeEvent<HTMLSelectElement>) => props.onChange(e, article),
                            multiple: true,
                            defaultValue: article.tags,
                            required: true,
                        }}
                    />
                ),
                article.views,
                // Same info in SecretTwins as right above so that artId is submitted no matter what
                (
                    <input
                      type="number"
                      onChange={(e) => props.onChange(e, article)}
                      name="displayOrder"
                      defaultValue={`${article.displayOrder}`}
                    />
                ),
                (
                    <input
                      key={article.id}
                      onChange={props.onDelete}
                      type="checkbox"
                      name="delete"
                      value={article.id}
                    />
                )
            ];
    });
}