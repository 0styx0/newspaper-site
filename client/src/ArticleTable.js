import React from 'react';
import {Container} from './components/Container';
import Table from './components/Table';
import Form from './components/Form';
import {Input, Select, SecretTwins} from './components/Input';



class ArticleTable extends React.Component {

    constructor() {
        super();

        this.state = {

            articles: [[]],
            tags: [], // this is all tags that exist in any article ever published
            issueInfo: {}
        };
    }

    async componentWillMount() {

        // NOTE: REMOVE query after done building this
        const rawData= await fetch('/api/articleGroup?articlesFor=1', {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await rawData.json();

        const articleArr = data[0].map(article => {

            const tagArr = article.tags.split(', ');

            return [
                <a href={`/issue/${data[1].num}/story/${article.url}`}>{decodeURIComponent(article.url)}</a>,
                article.created,
                <a href={`/u/${article.author_username}`}>{article.author_name}</a>,
                <select name="tag[]" formMethod="put" defaultValue={tagArr} required multiple>{data[1].map((val) =>
                     <option key={val} value={val}>{val}</option>
                )}</select>,
                article.views,
                <input type="number" formMethod="put" name="order[]" value={article.display_order} />,
                <SecretTwins
                  original={<input type="checkbox" formMethod="delete" name="delArt[]" value={article.art_id} />}
                  props = {{
                      name: "artId[]"
                  }}

                />
            ]
        });

        this.setState({articles: articleArr});
    }

    render() {

        const headings = ['Article', 'Date Created', 'Uploaded By', 'Type', 'Views', 'Display Order', <span className="danger">Delete</span>];

        return (
            <Container
                heading="Articles"
                className="tableContainer"
                children={<Form
                               method={['put', 'delete']}
                              children={<Table headings={headings} rows={this.state.articles}/>}
                          />}
            />
        )
    }
}

export default ArticleTable;