import React from 'react';
import {jwt} from '../../jwt';
import fetchFromApi from '../../../helpers/fetchFromApi';
import { Link } from 'react-router-dom'

import PropTypes from 'prop-types';

import './index.css';

/**
 * @prop profileLink
 * @prop author
 * @prop authorid
 * @prop content
 * @prop id?
 */
class Comment extends React.Component {

    constructor(props) {
        super(props);

        this.delete = this.delete.bind(this);

        this.state = {
            content: this.props.content,
        }
    }

    delete() {

        this.setState({
            content: 'deleted'
        });

        const info = {
            id: this.props.id
        }

        fetchFromApi("comment", "delete", info);
    }

    render() {

        let deleteButton = <span />;

        if (this.props.content !== "deleted" &&
            (jwt.level > 2 || jwt.id === this.props.authorid) &&
            this.props.id // new comments won't have or be able to have an id
            ) {

            deleteButton = <button className="deleteReply" onClick={this.delete}>Delete</button>;
        }

        return <article className="comment">
                    <Link className="author" to={'/u/'+this.props.profileLink}>{this.props.author}</Link>
                    <div className="content" dangerouslySetInnerHTML={{__html: this.props.content}} />
                    {deleteButton}
               </article>
    }
}

Comment.propTypes = {

    profileLink: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    authorid: PropTypes.number.isRequired,
    content: PropTypes.string.isRequired,
    // addComment: PropTypes.func.isRequired,
    // deleteComment: PropTypes.func.isRequired
}

export default Comment;