import React from 'react';
import { Redirect } from 'react-router'

import TagSelect from '../';


export default class SelectTagPreview extends React.Component {

    constructor() {
        super();

        this.state = {
            redirect: ""
        }
        this.onChange = this.onChange.bind(this);
    }

    onChange(event) {


        this.setState({
            redirect: `/tag/${event.target.value}`
        })
    }


    render() {

        return  <span key={this.state.redirect}>
                    <TagSelect
                        tags={["Current Issue"]}
                        props={{
                            defaultValue: window.location.pathname.split("/")[2] || "../",
                            onChange: this.onChange
                        }}
                    />
                    {this.state.redirect ? <Redirect to={this.state.redirect} /> : ""}
                </span>

    }
}

