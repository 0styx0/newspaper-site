import * as React from 'react';

import Container from '../../components/Container';
import Table from '../../components/Table';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import TagSelect from '../../components/TagSelect';
import SecretTwinsContainer from '../../components/Form/SecretTwins/container';
import { Link } from 'react-router-dom'

interface Props {
    articles: Array<{
        tags: string;
        url: string;
        author_username: string;
        author_name: string;
        art_id: number;
        display_order: number;
        created: string;
        views: number
    }>;
    issue: {
        num: number;
        max: number;
    };
    update: Function;
};

export default function ArticleTable(props: Props) {


    const headings = [
        'Article',
        'Date Created',
        'Uploaded By',
        'Type',
        'Views',
        'Display Order',
        <span className="danger">Delete</span>
    ];

    const rows = createArticleTableRows(props);

    return <Container
        heading="Articles"
        className="tableContainer"
        children={
            <div>
                <Input
                    label="Issue Number"
                    props={{
                    type: "number",
                    min: 1,
                    value: props.issue ? props.issue.num : 1,
                    max: props.issue ? props.issue.max : 1,
                    onChange: props.update
                    }}
                />
                <FormContainer
                    method={['put', 'delete']}
                    action="/api/articleGroup"
                    children={
                        <div>
                            <Table headings={headings} rows={rows}/>

                            <Input
                                label="Password"
                                props={{
                                    type: "password",
                                    name: "password",
                                    required: true
                                }}
                            />
                            <input type="submit" value="Modify" />
                        </div>
                    }
                />
            </div>
        }
    />
}


function createArticleTableRows(props: Props) {

    if (!props.articles) {
        return [[]];
    }

    return props.articles.map(article => {

            const tagArr = article.tags.split(', ');

            return [
                <Link to={`/issue/${props.issue.num}/story/${article.url}`}>{decodeURIComponent(article.url)}</Link>,
                article.created,
                <Link to={`/u/${article.author_username}`}>{article.author_name}</Link>,
                <SecretTwinsContainer
                    original={<TagSelect
                                props={{
                                    name: "tag[]",
                                    formMethod: "put",
                                    multiple: true,
                                    defaultValue: tagArr,
                                    required: true,
                                }}
                                />}
                    props={{
                        name: "artId[]",
                        value: article.art_id
                    }}
                />,
                article.views,
                // Same info in SecretTwins as right above so that artId is submitted no matter what
                <SecretTwinsContainer
                    original={<input type="number" formMethod="put" name="order[]" defaultValue={`${article.display_order}`} />}
                    props = {{
                        name: "artId[]",
                        formMethod: "put",
                        value: article.art_id
                    }}
                />,
                <input type="checkbox" formMethod="delete" name="delArt[]" value={article.art_id} />
            ]
    });
}