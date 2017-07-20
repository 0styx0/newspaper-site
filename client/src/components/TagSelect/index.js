import React from 'react';
import { Redirect } from 'react-router'

class TagSelect extends React.Component {

    constructor() {
        super();

        this.state = {
            redirect: false
        }
        this.onChange = this.onChange.bind(this);
    }
    // I wonder if I can render MainPage from here

    onChange(event) {


        this.setState({
            redirect: `/tag/${event.target.value}`
        })
    }


    render() {

        const tags = [
                'Current Issue',
                'news',
                'reaction',
                'opinion',
                'poll',
                'features',
                'sports',
                'politics',
                'other'
            ];

        return (
            <span key={this.state.redirect}>
            <select value={window.location.pathname.split("/")[2] || "../"} onChange={this.onChange}>
                {tags.map((val => {
                    if (val === "Current Issue") {
                        return <option key={val} value="../">{val[0].toUpperCase() + val.slice(1)}</option>
                    }
                    return <option key={val} value={val}>{val[0].toUpperCase() + val.slice(1)}</option>
                }))}
            </select>
            {this.state.redirect ? <Redirect to={this.state.redirect} /> : ""}

            </span>

        )
    }

}

export default TagSelect;