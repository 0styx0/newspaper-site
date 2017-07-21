import React from 'react';
import {jwt} from '../../jwt';
import fetchFromApi from '../../../helpers/fetchFromApi';

import PropTypes from 'prop-types';

import Comment from './';


/**
 * @param props - @see CommentContainer.propTypes
 */
class CommentContainer extends React.Component {

    constructor(props) {
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

        const commentProps = {
            author: this.state.author,
            profileLink: this.props.profileLink,
            content: this.state.content
        }

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

// @see Comment 's propTypes, which are much the same
CommentContainer.propTypes = {

    profileLink: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    authorid: PropTypes.number.isRequired,
    id: PropTypes.number
}

export default CommentContainer;