import React from 'react';

import httpNotification from '../../helpers/Notification';
import fetchFromApi from '../../helpers/fetchFromApi';

import Mission from './';

export default class MissionContainer extends React.Component {

    constructor() {
        super();

        this.submit = this.submit.bind(this);

        this.state = {
            content: ""
        }
    }

    async componentWillMount() {

        const mission = await fetch("./missionView.html")
                                .then(data => data.text());
        this.setState({
            content: mission
        });
    }

    submit() {


        fetchFromApi("mission", "put", {
                edit: this.state.content
        })
        .then((response) => {

            httpNotification(response.status, response.statusText);
        });

    }

    render() {

        return <Mission
                 content={this.state.content}
                 submit={this.submit}
                 save={(e) => this.setState({content: e.target.innerHTML})}
               />
    }
}