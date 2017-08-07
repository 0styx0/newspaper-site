import * as React from 'react';
import fetchFromApi from '../../../helpers/fetchFromApi';

import EditableComment from './';

interface Props {
    issue: number; // issue of parent article
    name: string; // name (url) of article (ex: name in http://localhost:3001/issue/1/story/name)
    addToList: Function; // callback where content is passed into after user submits the comment
}

interface State {
    content: string;
}

export default class EditableCommentContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.save = this.save.bind(this);

        this.state = {
            content: ''
        }
    }

    /**
     * Sends comment to be saved to database
     */
    save() {

        this.props.addToList(this.state.content);

        const info = {
            issue: this.props.issue,
            url: this.props.name,
            content: this.state.content
        }

        fetchFromApi("comment", "post", info);
    }

    render() {

        return <EditableComment
                 onSubmit={this.save}
                 onBlur={(e: Event) => this.setState({content: (e.target as HTMLElement).innerHTML}) as any}
               />
    }

}
