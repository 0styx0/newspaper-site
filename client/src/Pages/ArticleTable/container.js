import React from 'react';
import fetchFromApi from '../../helpers/fetchFromApi';

import ArticleTable from './';

export default class ArticleTableContainer extends React.Component {

    constructor() {
        super();

        this.putData = this.putData.bind(this);

        this.state = {
            history: []
        };
    }

    async putData(num = null) {

        const lastPath = +window.location.pathname.split("/").slice(-1);

        num = (isNaN(lastPath) || ((!isNaN(num)) && num)) ? num : lastPath;


        // use cached results (don't load new info)
        if (this.state.history[num]) {
            this.setState({
                articles: this.state.history[num].articles,
                issueInfo: this.state.history[num].issueInfo
            });

            window.history.pushState({}, `Issue ${num}`, num);
        }
        else {

            const data = await this.getData(num);
            const json = await data.json();

            window.history.pushState({}, `Issue ${num}`, isNaN(lastPath) ? "modifyArticles/"+json[2].num : json[2].num);

            this.setArticleInfo(json);
        }
    }

    componentWillMount() {

        this.putData(null);
    }

    async getData(num) {

         return await fetchFromApi(`articleGroup?articlesFor=${num}`);

    }


    setArticleInfo(data) {

        const history = [...this.state.history];
        history[data[2].num] = {articles: data[0], issueInfo: data[2]};

        this.setState({
            articles: data[0].length ? data[0] :  null,
            issueInfo: data[2],
            history
        });
    }

    render() {

            return <ArticleTable
                     articles={this.state.articles}
                     issue={this.state.issueInfo}
                     update={(e) => this.putData(e.target.value)}
                   />
    }
}
