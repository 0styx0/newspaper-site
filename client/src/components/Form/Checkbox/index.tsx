import * as React from 'react';

import './index.css';

interface Props {
    value: 'checked' | ''; // html value attr
    handleToggles: Function; // what to do when checkbox is toggled
    props: Object;
}

export default function Checkbox(props: Props) {

    const checkbox = React.cloneElement(<input />, props.props);

    return React.cloneElement(checkbox, {
        value: props.value,
        onClick: props.handleToggles,
        type: "checkbox"
    });
}
