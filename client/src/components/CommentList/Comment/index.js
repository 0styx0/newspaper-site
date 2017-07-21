import React from 'react';
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types';

import './index.css';

/**
 *@param props - @see Comment.propTypes
 */
export default function Comment(props) {

    return <article className="comment">
                <Link className="author" to={'/u/'+props.profileLink}>{props.author}</Link>
                <div className="content" dangerouslySetInnerHTML={{__html: props.content}} />
                {props.deleteButton ? <button className="deleteReply" onClick={props.deleteButton}>Delete</button> : ''}
            </article>


}

Comment.propTypes = {

    profileLink: PropTypes.string.isRequired, // email username (ex: username@email.tld)
    author: PropTypes.string.isRequired, // first middle? last name
    content: PropTypes.string.isRequired, // html string
    deleteButton: PropTypes.func // if given, a button will be created where `deleteButton` will be the click handler
}

