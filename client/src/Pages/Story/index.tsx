import * as React from 'react';
import EditableContainer from '../../components/Editable/container';
import CommentListContainer from '../../components/CommentList/container';
import { ArticleInfo } from './shared.interfaces';

import './index.css';
import { FocusEvent, MouseEvent } from 'react';
import { Helmet } from 'react-helmet';

interface Props extends ArticleInfo {
    onSaveEdits: (indexToSave: string, e: FocusEvent<HTMLElement>) => void;
    onSubmit: (e: MouseEvent<HTMLButtonElement>) => void;
}

function Story(props: Props) {

        return (
            <div>

                <Helmet>
                    <title>{`Issue #${props.issue}'s ${props.heading.match(/<h1>(.+)<\/h1>/)![1]}`}</title>
                    <meta
                        name="description"
                        content="Create an account"
                    />
                </Helmet>

                <div id="tags">Tag(s): {props.tags.join(', ')}</div>
                <article id="story">

                    <EditableContainer
                        canEdit={props.canEdit}
                        onSubmit={props.onSubmit}
                        key={props.id}
                        children={
                                <header
                                  onBlur={(e =>
                                   props.onSaveEdits('heading', e))}
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
                              onBlur={(e =>
                                props.onSaveEdits('body', e))}
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
