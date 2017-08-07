import * as React from 'react';

import Label from '../Label';

import './index.css';

interface Props {
    label: string;
    props: any; // really should be html attributes
}

/**
 * @prop label - string, contents of label element
 * @prop props - object of attributes of select
 */
export default function Select(props: Props) {

    const select = React.cloneElement(<select/>, props.props);

    return (
        <Label
            value={props.label}
            required={!!props.props.required}
            children={
                select
            }
        />
    );
}
