import * as React from 'react';
import EditableContainer from '../../Editable/container';
import { getJWT } from '../../jwt';

import '../Comment/index.css';
import './index.css';

interface Props {
    onSubmit: Function;
    onBlur: Function;
}

export default function EditableComment(props: Props) {

    const jwt = getJWT();

    return (
        <article id="reply" className="comment">
            <EditableContainer
                buttons="basic"
                canEdit={!!jwt.id}
                onSubmit={props.onSubmit as any}
                children={
                    <div
                        onBlur={props.onBlur as any}
                        className="content"
                    />
                }
            />
        </article>
    );
}
