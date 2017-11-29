import * as React from 'react';
import { CommentCreate } from '../../../graphql/comment';
import EditableComment from './';
import { withApollo, graphql } from 'react-apollo';

interface Props {
    artId: string;
    addToList: (content: string) => void; // callback where content is passed into after user submits the comment
    createComment: (params: {variables: { content: string, artId: string }}) => void;
}

interface State {
    content: string;
}

export class EditableCommentContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.onSave = this.onSave.bind(this);

        this.state = {
            content: ''
        };
    }

    /**
     * Sends comment to be saved to database
     */
    onSave() {

        this.props.addToList(this.state.content);

        this.props.createComment({
            variables: {
                artId: this.props.artId,
                content: this.state.content
            }
        });
    }

    render() {

        return (
            <EditableComment
                onSubmit={this.onSave}
                onBlur={(e: Event) => this.setState({content: (e.target as HTMLElement).innerHTML}) as any}
            />
        );
    }

}

export default withApollo(
    graphql(CommentCreate, {name: 'createComment'})(EditableCommentContainer as any)
);