import * as React from 'react';

import httpNotification from '../../helpers/Notification';
import fetchFromApi from '../../helpers/fetchFromApi';

import Mission from './';

interface State {
    content: string;
}

export default class MissionContainer extends React.Component<{}, State> {

    constructor() {
        super();

        this.submit = this.submit.bind(this);

        this.state = {
            content: ""
        }
    }

    async componentWillMount() {

        const mission = await fetch("./missionView.html")
                                .then((data: {text: Function}) => data.text());
        this.setState({
            content: mission
        });
    }

    submit() {


        fetchFromApi("mission", "put", {
                edit: this.state.content
        })
        .then((response: {status: number; statusText: string;}) => {

            httpNotification(response.statusText, response.status);
        });

    }

    render() {

        return <Mission
                 content={this.state.content}
                 submit={this.submit}
                 save={(e: Event) => this.setState({content: (e.target as HTMLElement).innerHTML}) as any}
               />
    }
}