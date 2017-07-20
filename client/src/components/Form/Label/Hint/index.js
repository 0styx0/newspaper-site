import React from 'react';

export default class Hint extends React.Component {

    constructor() {
        super();

        this.state = {
            reveal: false
        };
    }

    render() {

        if (this.state.reveal) {

            return (
                <span>
                    <abbr onClick={() => this.setState({reveal: false})} title={this.props.title}>?</abbr>
                    <br />
                    <div className="abbrMessage">{this.props.title}</div>
                </span>
                )
        }
        else {

            return (<abbr onClick={() => this.setState({reveal: true})} title={this.props.title}>?</abbr>)
        }
    }
}

