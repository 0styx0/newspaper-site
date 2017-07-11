import React from 'react';
import Editable from './Editable';
import {jwt} from './jwt';

/**
 * @prop profileLink
 * @prop author
 * @prop authorid
 * @prop created
 * @prop content
 */
class Comment extends React.Component {

    newComment() {

        return <article id="reply" className="comment">
                    <Editable
                        canEdit={!!jwt.id /*if logged in*/}
                        buttons="basic"
                        children={
                            <div className="content" dangerouslySetInnerHTML={{__html: this.props.content}} />
                        }
                    />
                </article>
    }

    oldComment() {

        return <article className="comment">
                <a className="author" href={this.props.profileLink}>{this.props.author}</a>
                <div className="content">{this.props.content}</div>
                <button className="deleteReply">Delete</button>
               </article>
    }

    switchboard() {

        return !this.props.content ? this.newComment() : this.oldComment();
    }

    render() {
        return (
            this.switchboard()
        );
    }
}

export default Comment;