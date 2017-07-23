import React from 'react';
import PropTypes from 'prop-types';

import Label from '../Label';

import './index.css';

/**
 * @prop label - string, contents of label element
 * @prop props - object of attributes of select
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

Select.propTypes = {
    label: PropTypes.string.isRequired,
    props: PropTypes.object
}