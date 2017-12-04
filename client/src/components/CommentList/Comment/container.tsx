import * as React from 'react';
import { getJWT } from '../../../helpers/jwt';
import { CommentDelete } from '../../../graphql/comment';
import Comment from './';
import { graphql, withApollo } from 'react-apollo';
import { MouseEvent } from 'react';
import graphqlErrorNotifier from '../../../helpers/graphqlErrorNotifier';

// @see Comment 's Props, which are much the same
export interface Props {
    profileLink: string;
    author: string;
    content: string;
    authorid: string;
    id: string;
    // not really void. but not using return value
    deleteComment: (params: {variables: { id: string }}) => void;
}

interface State {
    content: string;
    author: string;
}

/**
 * @param props - @see CommentContainer Props
 */
export class CommentContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.onDelete = this.onDelete.bind(this);

        this.state = {
            content: this.props.content,
            author: this.props.author
        };
    }

    /**
     * Sends request to server to delete the comment
     *
     * Rerenders the Comment making it clear that it was deleted
     */
    onDelete() {

        this.setState({
            content: 'deleted',
            author: 'Deleted User'
        });

        graphqlErrorNotifier(
            this.props.deleteComment, {
                variables: {
                    id: this.props.id
                }
            },
            'commentDeleted'
        );
    }

    render() {

        const commentProps: {
            author: string;
            profileLink: string;
            content: string;
            onDelete?: (e: MouseEvent<HTMLButtonElement>) => void
        } = {
            author: this.state.author,
            profileLink: this.props.profileLink,
            content: this.state.content
        };

        const jwt = getJWT();

        // if already deleted, or user not authorized to delete,
        // or it was just created so info needed to delete isn't there yet
        if (this.props.content !== 'deleted' &&
            (jwt.level > 2 || jwt.id === this.props.authorid) &&
            this.props.id
            ) {

            commentProps.onDelete = this.onDelete;
        }

        return <Comment {...commentProps} />;
    }
}

// tslint:disable-next-line:no-any
const CommentContainerWithData = graphql(CommentDelete, {name: 'deleteComment'})(CommentContainer as any);

export default withApollo(CommentContainerWithData);