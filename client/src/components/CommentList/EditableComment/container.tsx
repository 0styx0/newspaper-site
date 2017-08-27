import * as React from 'react';
import fetchFromApi from '../../../helpers/fetchFromApi';

import EditableComment from './';

interface Props {
    artId: string;
    addToList: Function; // callback where content is passed into after user submits the comment
}

interface State {
    content: string;
}

export default class EditableCommentContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.save = this.save.bind(this);

        this.state = {
            content: ''
        };
    }

    /**
     * Sends comment to be saved to database
     */
    save() {

        this.props.addToList(this.state.content);

        const info = {
            artId: this.props.artId,
            content: this.state.content
        };

        fetchFromApi('comment', 'post', info);
    }

    render() {

        return (
            <EditableComment
                onSubmit={this.save}
                onBlur={(e: Event) => this.setState({content: (e.target as HTMLElement).innerHTML}) as any}
            />
        );
    }

}
