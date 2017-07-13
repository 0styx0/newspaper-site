import React from 'react';
import Editable from './components/Editable';
import {jwt} from './components/jwt';

class Mission extends React.Component {

    constructor() {
        super();

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

    render() {

        return <Editable
                    key={this.state.content}
                    canEdit={jwt.level > 2}
                    children={<div className="noH1Margin" dangerouslySetInnerHTML={{__html: this.state.content}} />}
                />
    }
}

export default Mission;