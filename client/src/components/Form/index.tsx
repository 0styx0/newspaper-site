import * as React from 'react';

import './index.css';

interface Props {
    props: any, // html attrs
    children: JSX.Element;
}

export default function Form(props: Props) {

    const form = React.cloneElement(<form children={props.children} />, props.props);

    return form;
}
