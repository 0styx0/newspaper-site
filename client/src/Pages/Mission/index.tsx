import * as React from 'react';
import EditableContainer from '../../components/Editable/container';

import './index.css';

interface Props {
    onSubmit: Function;
    content: string;
    onSave: Function;
    canEdit: boolean;
}

export default function Mission(props: Props) {

    return (
        <EditableContainer
            key={props.content}
            canEdit={props.canEdit}
            onSubmit={props.onSubmit as any}
        >
            <div
              className="mission"
              dangerouslySetInnerHTML={{__html: props.content}}
              onBlur={props.onSave as any}
            />
        </EditableContainer>
    );
}
