import * as React from 'react';
import EditableContainer from '../../components/Editable/container';
import CommentListContainer from '../../components/CommentList/container';
import CommentContainer from '../../components/CommentList/Comment/container';
import httpNotification from '../../helpers/Notification';
import fetchFromApi from '../../helpers/fetchFromApi';

import './index.css';

interface Article {
    heading: string;
    body: string;
    canEdit: boolean;
    comments: CommentContainer[];
    tags: string;
    id: string;
}

interface State extends Article {
    issue: number | null;
    name: string | null;
}

class Story extends React.Component<{}, State> {

    constructor() {
        super();


        this.submit = this.submit.bind(this);

        this.state = {

            heading: "",
            body: "",
            canEdit: false,
            comments: [],
            tags: "",
            id: '',
            issue: null,
            name: null
        }
    }

    async componentWillMount() {


        const url = window.location.pathname.split("/");
        await this.setState({issue: +window.location.pathname.split("/")[2], name: url[4]});

        const article = await fetchFromApi(`story?issue=${this.state.issue}&name=${this.state.name}`)
        .then(data => data.json());

        const heading = article.body.match(/^[\s\S]+?<\/h4>/)![0];
        const body = article.body.replace(heading, "");



        this.setState({
            heading,
            body,
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

            httpNotification(response.statusText as string, response.status as number);
        });
    }

    createCommentList(commentData: {
        author_name: string;
        profile_link: string;
        authorid: string;
        content: string;
        name: string;
        id: string;
    }[]) {

        const comments = commentData.map((comment, idx) =>

            <CommentContainer
                author={comment.author_name}
                profileLink={comment.profile_link}
                authorid={comment.authorid}
                content={comment.content}
                key={idx}
                id={comment.id}
            /> as any as CommentContainer
        )

        return comments;
    }

    render() {

        return (
            <div>
                <div id="tags">Tag(s): {this.state.tags}</div>
                <article id="story">

                    <EditableContainer
                        canEdit={this.state.canEdit}
                        submit={this.submit}
                        key={this.state.id}
                        children={
                                <header
                                  onBlur={((e: Event) =>
                                    this.setState({heading: (e.target as HTMLElement).innerHTML})) as any}
                                  dangerouslySetInnerHTML={{__html: this.state.heading}}
                                />
                        }
                    />

                    <EditableContainer
                        canEdit={this.state.canEdit}
                        key={this.state.id + 1}
                        buttons="none"
                        children={
                            <section
                              onBlur={((e: Event) =>
                                this.setState({body: (e.target as HTMLElement).innerHTML})) as any}
                              className="storyContainer"
                              dangerouslySetInnerHTML={{__html: this.state.body}}
                            />
                        }
                    />
                </article>

                <hr />

                <div id="comments">
                    <CommentListContainer
                      issue={this!.state!.issue! as number}
                      Comments={this.state.comments as any}
                    />
                </div>
           </div>
        );
    }
}

export default Story;