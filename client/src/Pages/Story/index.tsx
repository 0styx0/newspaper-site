import * as React from 'react';
import EditableContainer from '../../components/Editable/container';
import CommentListContainer from '../../components/CommentList/container';
import CommentContainer from '../../components/CommentList/Comment/container';
import { ArticleInfo } from './shared.interfaces';

import './index.css';

interface Props extends ArticleInfo {
    onSaveEdits: (indexToSave: string, e: Event) => void;
    onSubmit: Function;
}

function Story(props: Props) {

        const comments = props.comments.map((comment, idx) =>

            (
                <CommentContainer
                    author={comment.author.fullName}
                    profileLink={comment.author.profileLink}
                    authorid={comment.author.id}
                    content={comment.content}
                    key={idx}
                    id={comment.id}
                />)
        );

        return (
            <div>
                <div id="tags">Tag(s): {props.tags.all.join(', ')}</div>
                <article id="story">

                    <EditableContainer
                        canEdit={props.canEdit}
                        submit={props.onSubmit as any}
                        key={props.id}
                        children={
                                <header
                                  onBlur={((e: Event) =>
                                   props.onSaveEdits('heading', e)) as any}
                                  dangerouslySetInnerHTML={{__html: props.heading}}
                                />
                        }
                    />

                    <EditableContainer
                        canEdit={props.canEdit}
                        key={props.id + 1}
                        buttons="none"
                        children={
                            <section
                              onBlur={((e: Event) =>
                                props.onSaveEdits('body', e)) as any}
                              className="storyContainer"
                              dangerouslySetInnerHTML={{__html: props.body}}
                            />
                        }
                    />
                </article>

                <hr />

                <div id="comments">
                    <CommentListContainer
                      issue={props.issue}
                      Comments={comments}
                    />
                </div>
           </div>
        );
}

export default Story;