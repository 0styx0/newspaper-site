import * as React from 'react';
import CommentContainer from './Comment/container';
import EditableCommentContainer from './EditableComment/container';
import { Comment } from './shared.interface';

import './index.css';

interface Props {
    comments: Comment[];
    canAdd: boolean; // if user can comment
    onAdd: Function;
    artId: string;
}

export default function CommentList(props: Props) {

    const Comments = (props.comments || []).map((comment: Comment) =>

        (
            <CommentContainer
                author={comment.author.fullName}
                profileLink={comment.author.profileLink}
                authorid={comment.author.id}
                content={comment.content}
                key={comment.id}
                id={comment.id}
            />)
    );

    if (props.canAdd) {

        Comments.push(
            <EditableCommentContainer
                addToList={props.onAdd}
                artId={props.artId}
                key={props.comments.length}
            />);
    }

    return (
        <div id="comments">
            {Comments}
        </div>
    );

}
