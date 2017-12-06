import * as React from 'react';
import { CommentCreate } from '../../../graphql/comment';
import EditableComment from './';
import { withApollo, graphql } from 'react-apollo';
import { FocusEvent } from 'react';
import graphqlErrorNotifier from '../../../helpers/graphqlErrorNotifier';

export interface Props {
    artId: string;
    addToList: (content: string) => void; // callback where content is passed into after user submits the comment
    createComment: (params: {variables: { content: string, artId: string }}) => void;
}

export interface State {
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

        graphqlErrorNotifier(
            this.props.createComment,
            {
                variables: {
                    artId: this.props.artId,
                    content: this.state.content
                }
            },
            'commentCreated'
        )
         .then(() => this.props.addToList(this.state.content));
    }

    render() {

        return (
            <EditableComment
                onSubmit={this.onSave}
                onBlur={(e: FocusEvent<HTMLDivElement>) =>
                    this.setState({ content: (e.target as HTMLElement).innerHTML })}
            />
        );
    }

}

export default withApollo(
    // tslint:disable-next-line:no-any
    graphql(CommentCreate, {name: 'createComment'})(EditableCommentContainer as any)
);