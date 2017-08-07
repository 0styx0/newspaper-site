import * as React from 'react';
import { Link } from 'react-router-dom'

import './index.css';

interface Props {
    profileLink: string; // email username (ex: username@email.tld)
    author: string; // first middle? last name
    content: string; // html string
    deleteButton?: Function; // if given, a button will be created where `deleteButton` will be the click handler
}

/**
 *@param props - @see Comment Props
 */
export default function Comment(props: Props) {

    return <article className="comment">
                <Link className="author" to={'/u/'+props.profileLink}>{props.author}</Link>
                <div className="content" dangerouslySetInnerHTML={{__html: props.content}} />
                {props.deleteButton ? <button className="deleteReply" onClick={props.deleteButton as any}>Delete</button> : ''}
            </article>


}
