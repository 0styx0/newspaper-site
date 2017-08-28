import * as React from 'react';

import { Comment } from './shared.interface';
import { getJWT } from '../jwt';

import CommentList from './';

interface Props {
    comments: Comment[];
    artId: string;
}

interface State {
    comments: Comment[];
}

/**
 * Creates a list of comments
 */
export default class CommentListContainer extends React.Component<Props, State> {

    /**
     * Seed initial state with props.comments
     */
    constructor(props: Props) {
        super(props);

        this.onAdd = this.onAdd.bind(this);

        this.state = {
            comments: props.comments
        };

    }

    /**
     * @param content - html? string
     *
     * Rerenders CommentList with EditableComment changed to Comment, and pushes a new EditableComment to the list
     */
    onAdd(content: string) {

        const comments = this.state.comments.slice();
        const jwt = getJWT();

        comments.push({
                content,
                author: {
                    profileLink: jwt.profileLink,
                    fullName: 'You',
                    id: jwt.id
                },
                canDelete: true,
                dateCreated: (new Date()).toISOString(),
                id: new Date().toString() /* random temp id*/
        });

        this.setState({
            comments
        });
    }

    render() {

        return (
            <CommentList
              comments={this.state.comments}
              canAdd={!!getJWT().level}
              onAdd={this.onAdd}
              artId={this.props.artId}
            />
        );
    }
}
