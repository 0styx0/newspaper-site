import React from 'react';
import Editable from '../../components/Editable';
import CommentList from '../../components/CommentList';
import Comment from '../../components/CommentList/Comment';
import httpNotification from '../../components/Notification';
import fetchFromApi from '../../helpers/fetchFromApi';

import './index.css';

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

        const article = await fetchFromApi(`story?issue=${this.state.issue}&name=${this.state.name}`)
        .then(data => data.json());

        const heading = article.body.match(/^[\s\S]+?<\/h4>/)[0];
        const body = article.body.replace(heading, "");



        this.setState({
            heading,
            body: body,
            canEdit: article.can_edit,
            comments: this.createCommentList(article.comments),
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

        fetchFromApi("story", "put", info)
        .then((response) => {

            httpNotification(response.status, response.statusText);
        });
    }

    createCommentList(commentData) {

        const comments = commentData.map((comment, idx) =>

            <Comment
                author={comment.author_name}
                profileLink={comment.profile_link}
                authorid={comment.authorid}
                content={comment.content}
                issue={+this.state.issue}
                name={this.state.name}
                key={idx}
                id={comment.id}
            />
        )

        this.setState({comments})
    }

    render() {

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

                <hr />

                <div id="comments">
                    <CommentList
                      issue={this.state.issue}
                      name={this.state.name}
                      Comments={this.state.comments}
                    />
                </div>
           </div>
        );
    }
}

export default Story;