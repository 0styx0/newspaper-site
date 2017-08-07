import * as React from 'react';
import {jwt} from '../../jwt';
import fetchFromApi from '../../../helpers/fetchFromApi';

import Comment from './';


// @see Comment 's Props, which are much the same
interface Props {
    profileLink: string;
    author: string;
    content: string;
    authorid: string;
    id: string;
}

interface State {
    content: string;
    author: string;
}


/**
 * @param props - @see CommentContainer Props
 */
class CommentContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.delete = this.delete.bind(this);

        this.state = {
            content: this.props.content,
            author: this.props.author
        }
    }

    /**
     * Sends request to server to delete the comment
     *
     * Rerenders the Comment making it clear that it was deleted
     */
    delete() {

        this.setState({
            content: 'deleted',
            author: 'Deleted User'
        });

        const info = {
            id: this.props.id
        }

        fetchFromApi("comment", "delete", info);
    }

    render() {

        const commentProps: {author: string; profileLink: string; content: string; deleteButton?: Function} = {
            author: this.state.author,
            profileLink: this.props.profileLink,
            content: this.state.content
        };

        // if already deleted, or user not authorized to delete,
        // or it was just created so info needed to delete isn't there yet
        if (this.props.content !== "deleted" &&
            (jwt.level > 2 || jwt.id === this.props.authorid) &&
            this.props.id
            ) {

            commentProps.deleteButton = this.delete;
        }

        return <Comment
                 {...commentProps}
               />
    }
}

export default CommentContainer;