import * as React from 'react';
import EditableContainer from '../../components/Editable/container';
import CommentListContainer from '../../components/CommentList/container';
import { ArticleInfo } from './shared.interfaces';

import './index.css';

interface Props extends ArticleInfo {
    onSaveEdits: (indexToSave: string, e: Event) => void;
    onSubmit: Function;
}

function Story(props: Props) {

        return (
            <div>
                <div id="tags">Tag(s): {props.tags.all.join(', ')}</div>
                <article id="story">

                    <EditableContainer
                        canEdit={props.canEdit}
                        onSubmit={props.onSubmit as any}
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
                      artId={props.id}
                      comments={props.comments || []}
                    />
                </div>
           </div>
        );
}

export default Story;