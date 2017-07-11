import React from 'react';
import './stormStory.min.css'
import EditableHTML from './components/EditableHTML';

class Story extends React.Component {

    constructor() {
        super();

        this.state = {

            heading: "",
            body: "",
            canEdit: false,
            comments: [],
            tags: "",
            id: null
        }
    }

    async componentWillMount() {

        const url = window.location.pathname.split("/");

        const article = await fetch(`/api/story?issue=${url[2]}&name=${url[4]}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(data => data.json());

        const heading = article.body.match(/^[\s\S]+?<\/h4>/);
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


    render() {

        return <EditableHTML
                        canEdit={this.state.canEdit}
                        location={[1]}
                        key={this.state.id}
                        kids={{

                            "0": <div id="tags">Tag(s): {this.state.tags}</div>,
                            "content": <article id="story" >

                                <div dangerouslySetInnerHTML={{__html: this.state.heading}}/>

                                <section className="storyContainer" dangerouslySetInnerHTML={{__html: this.state.body}}/>
                            </article>
                        }}
               />
    }
}

export default Story;