import * as React from 'react';
import EditableContainer from '../../components/Editable/container';
import { getJWT } from '../../components/jwt';

import './index.css';

interface Props {
    onSubmit: Function;
    content: string;
    onSave: Function;
}

export default function Mission(props: Props) {

    const jwt = getJWT();

    return (
        <EditableContainer
            key={props.content}
            canEdit={jwt.level > 2}
            submit={props.onSubmit as any}
        >
            <div
              className="mission"
              dangerouslySetInnerHTML={{__html: props.content}}
              onBlur={props.onSave as any}
            />
        </EditableContainer>
    );
}
