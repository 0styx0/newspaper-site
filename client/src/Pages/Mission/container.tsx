import * as React from 'react';

import { graphql, withApollo, compose } from 'react-apollo';
import { MissionEdit, MissionQuery } from '../../graphql/mission';

import Mission from './';

export interface Props {
    editMission: (params: { query: typeof MissionEdit, variables: { mission: string } }) => Promise<{
        data: {
            editMission: {
                mission: string
            }
        }
    }>;
    data: {
        mission: {
            mission: string;
            canEdit: boolean;
        }
    };
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
    async componentWillReceiveProps(props: Props) {

        if (props.data.mission.mission) {

            this.setState({
                content: props.data.mission.mission
            });
        }
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

        if (!this.state.content) {
            return null;
        }
        
        return (
            <Mission
                content={this.state.content}
                onSubmit={this.onSubmit}
                onSave={(e: Event) => this.setState({content: (e.target as HTMLElement).innerHTML}) as any}
                canEdit={this.props.data.mission.canEdit}
            />
        );
    }
}

const MissionContainerWithData = compose(
    graphql(MissionEdit, {name: 'editMission'}),
    graphql(MissionQuery),
)(MissionContainer as any);

export default withApollo(MissionContainerWithData);
