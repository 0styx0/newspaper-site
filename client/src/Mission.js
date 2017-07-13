import React from 'react';
import Editable from './components/Editable';
import {jwt} from './components/jwt';

class Mission extends React.Component {

    constructor() {
        super();

        this.save = this.save.bind(this);

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

    save() {


        fetch("/api/mission", {
            credentials: "include",
            method: "put",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                edit: this.state.content
            })
        });

    }

    render() {

        return <Editable
                    key={this.state.content}
                    canEdit={jwt.level > 2}
                    submit={this.save}
                    children={<div
                                className="noH1Margin container"
                                dangerouslySetInnerHTML={{__html: this.state.content}}
                                onBlur={e => this.setState({
                                    content: e.target.innerHTML
                                })}
                              />}

                />
    }
}

export default Mission;