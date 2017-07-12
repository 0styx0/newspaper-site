import React from 'react';
import './mainPage.css';
/*
<!-- for use in js (to copy) -->
<div id="template" className="preview">
    <div className="content"></div>
    <a className="small">Read More</a>
    <span className="small"></span>
</div>
*/

function Preview(props) {

    return (
        <div className="preview">
            <div className="content" dangerouslySetInnerHTML={{__html: props.lede}} />
            <a className="small" href={`/issue/${props.issue}/story/${props.url}`}>Read More</a>
            <span className="small">({props.views} views)</span>
        </div>
    )
}

class Numberline extends React.Component {

    constructor() {
        super();

        this.state = {
            max: 0,
            current: 0
        }
    }

    getData() {


        const allIssues = [].fill(0, 0, this.state.max - 1)
                               .map((val, issue) => <a href={`/issue/${issue + 1}`}>{issue + 1}</a>);

        return allIssues;
    }

    render() {
        return <span id="issueRange">
                   {this.getData()}
               </span>
    }
}

class Slideshow extends React.Component {

    constructor() {
        super();

        this.state = {
            images: []
        }
    }

    render() {

        return <div>

                    <div id="slideShow">
                        <a id="slideLink" href="">
                            <img id="placeholderPic" src="../images/tabc_logo.png" alt="Pictures in articles - slideshow" />
                        </a>
                    </div>

                </div>
    }
}

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
            currentIssue: window.location.pathname[2]
        });

        const json = await fetch(`/api/previews?issueNum=${this.state.currentIssue}`, {
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
                    <Slideshow />
                    {this.state.articles.map((article => <Preview key={article.url} {...article} />))}
                    <Numberline max={this.state.maxIssue} current={this.state.currentIssue}/>
                </div>
                <footer id="credits" className="small">Created by <a href="https://dovidm.com">Dovid Meiseles</a> ('18)</footer>
            </div>

        )
    }

}

export default MainPage;