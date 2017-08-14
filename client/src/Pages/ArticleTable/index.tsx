import * as React from 'react';

import Container from '../../components/Container';
import Table from '../../components/Table';
import Input from '../../components/Form/Input';
import TagSelect from '../../components/TagSelect';
import { Link } from 'react-router-dom';


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

interface Props {
    issue: {
        num: number;
        max: number;
    };
    articles: Article[];
    onUpdate: Function;
    onSubmit: Function;
    onChange: (e: any, article: Article) => void;
    onDelete: Function;
}

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


function createArticleTableRows(props: Props) {

    if (!props.articles) {
        return [[]];
    }

    return props.articles.map((article: Article) => {

            return [
                (
                    <Link
                      key={article.url}
                      to={`/issue/${props.issue.num}/story/${article.url}`}
                    >
                      {decodeURIComponent(article.url)}
                    </Link>
                ),
                article.dateCreated,
                (
                    <Link
                      key={article.author.fullName}
                      to={`/u/${article.author.profileLink}`}
                    >
                      {article.author.fullName}
                    </Link>
                ),
                (
                    <TagSelect
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
                      value={article.id}
                    />
                )
            ];
    });
}