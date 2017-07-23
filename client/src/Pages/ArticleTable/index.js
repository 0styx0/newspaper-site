import React from 'react';
import PropTypes from 'prop-types';


import Container from '../../components/Container';
import Table from '../../components/Table';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import TagSelect from '../../components/TagSelect';
import SecretTwinsContainer from '../../components/Form/SecretTwins/container';
import { Link } from 'react-router-dom'

ArticleTable.propTypes = {
    articles: PropTypes.arrayOf(PropTypes.shape({

      tags: PropTypes.string,
      url: PropTypes.string,
      author_username: PropTypes.string,
      author_name: PropTypes.string,
      art_id: PropTypes.number,
      display_order: PropTypes.number,
      created: PropTypes.string,
      views: PropTypes.number
    })),
    issue: PropTypes.shape({
        num: PropTypes.number,
        max: PropTypes.number,

    })
}


export default function ArticleTable(props) {


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


function createArticleTableRows(props) {

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
                    original={<input type="number" formMethod="put" name="order[]" defaultValue={article.display_order} />}
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