import React from 'react';
import {Container} from './components/Container'
import commands from './execCommands.min.js'

class Story extends React.Component {

    componentWillMount() {

        const url = window.location.pathname.split("/");

        fetch(`/api/story?issue=${url[2]}&name=${url[4]}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    render() {
        return <Container heading="Story" />
    }
}

export default Story;