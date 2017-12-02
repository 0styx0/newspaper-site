import * as React from 'react';
import EditableContainer from '../../Editable/container';
import { getJWT } from '../../../helpers/jwt';
import { MouseEvent, FocusEvent } from 'react';
import '../Comment/index.css';
import './index.css';

interface Props {
    onSubmit: (e: MouseEvent<HTMLButtonElement>) => void;
    onBlur: (e: FocusEvent<HTMLDivElement>) => void;
}

export default function EditableComment(props: Props) {

    const jwt = getJWT();

    return (
        <article id="reply" className="comment">
            <EditableContainer
                buttons="basic"
                canEdit={!!jwt.id}
                onSubmit={props.onSubmit}
                children={
                    <div
                        onBlur={props.onBlur}
                        className="content"
                    />
                }
            />
        </article>
    );
}
