import React from 'react';
import Editable from './Editable';
import {jwt} from './jwt';

/**
 * @prop profileLink
 * @prop author
 * @prop authorid
 * @prop content
 * @prop issue
 * @prop name
 * @prop addComment - function, parent component should add value returned to comment list when called
 */
class Comment extends React.Component {

    constructor(props) {
        super(props);

        this.submit = this.submit.bind(this);

        this.state = {
            content: this.props.content,
            author: this.props.author,
            authorid: this.props.authorid,
            profileLink: this.props.profileLink
        }
    }

    submit() {

        const info = {
            issue: this.props.issue,
            url: this.props.name,
            content: this.state.content
        }

        fetch("/api/comment", {
            credentials: "include",
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(info)
        });

        this.props.addComment({
            author_name: "You",
            authorid: jwt.id,
            content: this.state.content,
            created: Date.now(),
            id: Date.now(), // random thing to be used as comment key
            profile_link: jwt.email
        });
    }

    newComment() {

        return <article id="reply" className="comment">
                    <Editable
                        canEdit={!!jwt.id /*if logged in*/}
                        buttons="basic"
                        submit={this.submit}
                        children={
                            <div
                              onBlur={e => this.setState({content: e.target.innerHTML})}
                              className="content"
                              dangerouslySetInnerHTML={{__html: this.props.content}}
                            />
                        }
                    />
                </article>
    }

    oldComment() {

        return <article className="comment">
                <a className="author" href={'/u/'+this.props.profileLink}>{this.props.author}</a>
                <div className="content" dangerouslySetInnerHTML={{__html: this.props.content}} />
                <button className="deleteReply">Delete</button>
               </article>
    }

    switchboard() {


        return !this.props.author ? this.newComment() : this.oldComment();
    }

    render() {

        return (
            this.switchboard()
        );
    }
}

export default Comment;