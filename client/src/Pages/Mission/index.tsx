import * as React from 'react';
import EditableContainer from '../../components/Editable/container';
import { FocusEvent, MouseEvent } from 'react';
import './index.css';
import { Helmet } from 'react-helmet';

interface Props {
    onSubmit: (e: MouseEvent<HTMLButtonElement>) => void;
    content: string;
    onSave: (e: FocusEvent<HTMLDivElement>) => void;
    canEdit: boolean;
}

export default function Mission(props: Props) {

    return (
        <EditableContainer
            key={props.content}
            canEdit={props.canEdit}
            onSubmit={props.onSubmit}
        >
            <Helmet>
                <title>Mission</title>
                <meta
                    name="description"
                    content="Mission statement"
                />
            </Helmet>

            <div
              className="mission"
              dangerouslySetInnerHTML={{__html: props.content}}
              onBlur={props.onSave}
            />
        </EditableContainer>
    );
}
