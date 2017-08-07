import * as React from 'react';
import fetchFromApi from '../../helpers/fetchFromApi';

import ArticleTable from './';

interface State {
    articles: Array<{
        tags: string;
        url: string;
        author_username: string;
        author_name: string;
        art_id: number;
        display_order: number;
        created: string;
        views: number
    }>; // TODO: actually fill this out
    issueInfo: {
        num: number;
        max: number;
    };
    history: {
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
        issueInfo: {
            num: number;
            max: number;
        }
    }[];
}

export default class ArticleTableContainer extends React.Component<{}, State> {

    constructor() {
        super();

        this.putData = this.putData.bind(this);
    }

    async putData(num: number | null = null) {

        const lastPath = +window.location.pathname.split("/").slice(-1);

        num = (isNaN(lastPath) || ((!isNaN(+num!)) && num)) ? num : lastPath;


        // use cached results (don't load new info)
        if (num && this.state.history[num]) {
            this.setState({
                articles: this.state.history[num].articles,
                issueInfo: this.state.history[num].issueInfo
            });

            window.history.pushState({}, `Issue ${num}`, `${num}`);
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

    async getData(num: number | null) {

         return await fetchFromApi(`articleGroup?articlesFor=${num}`);

    }


    setArticleInfo(data: State) {

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
                     update={(e: Event) => this.putData(+(e.target as HTMLInputElement).value)}
                   />
    }
}
