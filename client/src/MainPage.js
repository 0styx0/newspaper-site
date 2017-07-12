import React from 'react';
/*
<!-- for use in js (to copy) -->
<div id="template" className="preview">
    <div className="content"></div>
    <a className="small">Read More</a>
    <span className="small"></span>
</div>
*/

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

        return <div id="mainContent">

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

        }
    }

    async componentWillMount() {

        this.setState({
            currentIssue: window.location.pathname[2]
        });

        fetch(`/api/previews?issueNum=${this.state.currentIssue}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
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
                <Slideshow />
                <Numberline max={this.state.maxIssue} current={this.state.currentIssue}/>
                <footer id="credits" className="small">Created by <a href="https://dovidm.com">Dovid Meiseles</a> ('18)</footer>
            </div>

        )
    }

}

export default MainPage;