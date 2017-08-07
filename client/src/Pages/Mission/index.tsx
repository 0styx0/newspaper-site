import * as React from 'react';
import EditableContainer from '../../components/Editable/container';
import {jwt} from '../../components/jwt';

import './index.css';

interface Props {
    submit: Function;
    content: string;
    save: Function;
};

export default function Mission(props: Props) {

    return <EditableContainer
                key={props.content}
                canEdit={jwt.level > 2}
                submit={props.submit as any}
                children={<div
                            className="mission"
                            dangerouslySetInnerHTML={{__html: props.content}}
                            onBlur={props.save as any}
                            />}
            />
}
