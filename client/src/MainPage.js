import React from 'react';
import './mainPage.css';
import Numberline from './components/Numberline';
import Slideshow from './components/Slideshow';
import Preview from './components/Preview';


class MainPage extends React.Component {

    constructor() {
        super();

        this.state = {
            issueName: "",
            maxIssue: 1,
            currentIssue: '',
            articles: [],
            slides: []
        }
    }

    async componentWillMount() {

        this.setState({
            currentIssue: window.location.pathname.split("/")[2]
        });

        const json = await fetch(`/api/previews?issueNum=${window.location.pathname.split("/")[2] || ''}`, {
                                credentials: "include",
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            }).then(data => data.json());

        this.setState({
            issueName: json.name,
            maxIssue: json.maxIssue,
            slides: json.slides,
            articles: json.articles
        });
    }

    renderHeader() {
        return (
                <header>
                   <h1>
                       <img src="../images/tabc_logo.png" alt="TABC Logo" />
                       Eye Of The Storm
                   </h1>
                   <q>A Clearer View Of TABC</q>
                   <h2>{this.state.issueName}</h2>
               </header>
        );
    }

    render() {

        return (
            <div>
                {this.renderHeader()}
                <div id="mainContent">
                    <Slideshow key={this.state.slides} images={this.state.slides}/>
                    {this.state.articles.map((article => <Preview key={article.url} {...article} />))}
                </div>
                <Numberline max={this.state.maxIssue} current={this.state.currentIssue}/>
                <footer id="credits" className="small">Created by <a href="https://dovidm.com">Dovid Meiseles</a> ('18)</footer>
            </div>

        )
    }

}

export default MainPage;