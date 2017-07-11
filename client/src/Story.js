import React from 'react';
import './stormStory.min.css'
import Editable from './components/Editable';
import Comment from './components/Comment';
import {jwt} from './components/jwt';

class Story extends React.Component {

    constructor() {
        super();


        this.submit = this.submit.bind(this);

        this.state = {

            heading: "",
            body: "",
            canEdit: false,
            comments: [],
            tags: "",
            id: null,
            issue: null,
            name: null
        }
    }

    async componentWillMount() {


        const url = window.location.pathname.split("/");
        await this.setState({issue: window.location.pathname.split("/")[2], name: url[4]});

        const article = await fetch(`/api/story?issue=${this.state.issue}&name=${this.state.name}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(data => data.json());

        const heading = article.body.match(/^[\s\S]+?<\/h4>/)[0];
        const body = article.body.replace(heading, "");

        this.setState({
            heading,
            body: body,
            canEdit: article.can_edit,
            comments: article.comments,
            tags: article.tags,
            id: article.id
        });
    }

    submit() {

        const info = {
            edit: this.state.heading + this.state.body,
            issue: this.state.issue,
            name: this.state.name
        }

        fetch("/api/story", {
            credentials: "include",
            method: "put",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(info)
        });
    }

    render() {

        // the concat makes the space for a new comment
        const commentsToRender = (jwt.id) ? this.state.comments.concat(['']) : this.state.comments;
        
        return (
            <div>
                <div id="tags">Tag(s): {this.state.tags}</div>
                <article id="story">

                    <Editable
                        canEdit={this.state.canEdit}
                        submit={this.submit}
                        key={this.state.id}
                        children={
                                <header onBlur={e => this.setState({heading: e.target.innerHTML})} dangerouslySetInnerHTML={{__html: this.state.heading}}/>
                        }
                    />

                    <Editable
                        canEdit={this.state.canEdit}
                        key={this.state.id + 1}
                        buttons={false}
                        children={
                            <section onBlur={e => this.setState({body: e.target.innerHTML})} className="storyContainer" dangerouslySetInnerHTML={{__html: this.state.body}}/>
                        }
                    />
                </article>

                <div className="break" />

                <div id="comments">

                    {commentsToRender.map((comment, idx) =>

                       <Comment
                          author={comment.author_name}
                          profileLink={comment.profile_link}
                          authorid={comment.authorid}
                          content={comment.content}
                          issue={this.state.issue}
                          name={this.state.name}
                          key={comment.id || this.state.comments.length + 1}
                          addComment={comment => {
                              this.setState({
                                  comments: this.state.comments.concat(comment)
                                })
                          }}
                       />
                    )}
                </div>
           </div>
        );
    }
}

export default Story;