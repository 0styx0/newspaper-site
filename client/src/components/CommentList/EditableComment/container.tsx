import * as React from 'react';
import { CommentCreate } from '../../../graphql/comment';
import EditableComment from './';
import { withApollo, graphql } from 'react-apollo';

interface Props {
    artId: string;
    addToList: Function; // callback where content is passed into after user submits the comment
    createComment: (params: {variables: { content: string, artId: string }}) => void;
}

interface State {
    content: string;
}

class EditableCommentContainer extends React.Component<Props, State> {

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
                onSubmit={this.save}
                onBlur={(e: Event) => this.setState({content: (e.target as HTMLElement).innerHTML}) as any}
            />
        );
    }

}

export default withApollo(
    graphql(CommentCreate, {name: 'createComment'})(EditableCommentContainer as any)
);