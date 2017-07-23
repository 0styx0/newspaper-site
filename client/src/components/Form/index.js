import React from 'react';
import PropTypes from 'prop-types';

import './index.css';



export default function Form(props) {

    const form = React.cloneElement(<form children={props.children} />, props.props);

    return form;
}

Form.propTypes = {
    props: PropTypes.shape({
        action: PropTypes.string.isRequired,
    }),
    children: PropTypes.element.isRequired
}