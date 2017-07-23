import React from 'react';
import NumberlineContainer from '../../components/Numberline/container';
import Slideshow from '../../components/Slideshow';
import Preview from '../../components/Preview';
import fetchFromApi from '../../helpers/fetchFromApi';

import './index.css';

class MainPage extends React.Component {

    constructor() {
        super();

        this.state = {
            issueName: "",
            maxIssue: 1,
            currentIssue: '',
            articles: [],
            slides: [],
            history: {}
        }
    }

    componentWillMount() {

        this.getPreviews();
    }

    async getPreviews() {


        const issue = window.location.pathname.split("/")[2];



        if (this.state.history[issue]) {

            return this.setState({
                issueName: this.state.history[issue].name,
                maxIssue: this.state.history[issue].maxIssue,
                slides: this.state.history[issue].slides,
                articles: this.state.history[issue].articles,
                currentIssue: issue
            });
        }

        const json = await fetchFromApi(`previews?issueNum=${issue || ''}`)
                             .then(data => data.json());

        const history = JSON.parse(JSON.stringify(this.state.history));

        history[issue || ''] = {
            issueName: json.name,
            maxIssue: json.maxIssue,
            slides: json.slides,
            articles: json.articles
        }

        this.setState({
            issueName: json.name,
            maxIssue: json.maxIssue,
            slides: json.slides,
            articles: json.articles,
            currentIssue: issue,
            history
        });

    }

    renderHeader() {
        return (
                <header>
                   <h1>
                       <img src="/images/tabc_logo.png" alt="TABC Logo" />
                       Eye Of The Storm
                   </h1>
                   <q>A Clearer View Of TABC</q>
                   <h2>{this.state.issueName}</h2>
               </header>
        );
    }

    componentWillUpdate() {

        if (this.state.currentIssue !== window.location.pathname.split("/")[2]) {

            this.getPreviews();
        }
    }

    render() {

        return (
            <div key={window.location.pathname}>
                {this.renderHeader()}
                <div id="mainContent">
                    <Slideshow key={this.state.slides} images={this.state.slides} />
                    {this.state.articles.map((article => <Preview key={article.url} {...article} />))}
                </div>
                <NumberlineContainer max={this.state.maxIssue} current={this.state.currentIssue}/>
                <footer id="credits" className="small">Created by <a href="https://dovidm.com">Dovid Meiseles</a> ('18)</footer>
            </div>

        )
    }

}

export default MainPage;