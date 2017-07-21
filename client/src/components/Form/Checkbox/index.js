import React from 'react';
import PropTypes from 'prop-types';

import './index.css';


export default function Checkbox(props) {

    const checkbox = React.cloneElement(<input />, props.props);

    return React.cloneElement(checkbox, {
        value: props.value,
        onClick: props.handleToggles,
        type: "checkbox"
    });
}

Checkbox.propTypes = {
    value: PropTypes.oneOf(['checked', '']), // html value attr
    handleToggles: PropTypes.func, // what to do when checkbox is toggled
    props: PropTypes.object
}
