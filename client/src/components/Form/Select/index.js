import React from 'react';
import Label from '../Label';

import './index.css';

/**
 * @prop label - string, contents of label element
 * @prop required - if it exists, the select gets `required attribute
 * @prop name - name of select
 * @prop className - class
 * @prop children - option elements
 */
export default function Select(props) {

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

