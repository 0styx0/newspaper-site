import * as React from 'react';
import EditableContainer from '../../Editable/container';
import { getJWT } from '../../jwt'

import '../Comment/index.css';
import './index.css';

interface Props {
    onSubmit: Function;
    onBlur: Function; // use case: saving current progress when use clicks away (specifically, this event must fire when clicking submit, and the input event was too frequent for my taste)
}

export default function EditableComment(props: Props) {

    const jwt = getJWT();

    return <article id="reply" className="comment">
                <EditableContainer
                    buttons="basic"
                    canEdit={!!jwt.id}
                    submit={props.onSubmit as any}
                    children={
                        <div
                            onBlur={props.onBlur as any}
                            className="content"
                        />
                    }
                />
            </article>
}
