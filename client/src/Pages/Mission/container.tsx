import * as React from 'react';

import { graphql, withApollo } from 'react-apollo';
import { MissionEdit } from '../../graphql/mission';

import Mission from './';

interface Props {
    editMission: (params: { query: typeof MissionEdit, variables: { mission: string } }) => Promise<{
        data: {
            editMission: {
                mission: string
            }
        }
    }>;
}

interface State {
    content: string;
}

export class MissionContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            content: ''
        };
    }

    /**
     * Gets mission statement
     */
    async componentWillMount() {

        const mission = await fetch('./missionView.html')
                                .then((data: {text: Function}) => data.text());
        this.setState({
            content: mission
        });
    }

    /**
     * Sends updates mission to server
     */
    onSubmit() {

        this.props.editMission({
            query: MissionEdit,
            variables: {
                mission: this.state.content
            }
        });
    }

    render() {

        return (
            <Mission
                content={this.state.content}
                onSubmit={this.onSubmit}
                onSave={(e: Event) => this.setState({content: (e.target as HTMLElement).innerHTML}) as any}
            />
        );
    }
}

const MissionContainerWithData = graphql(MissionEdit, {name: 'editMission'})(MissionContainer as any);

export default withApollo(MissionContainerWithData);
