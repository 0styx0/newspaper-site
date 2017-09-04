import * as React from 'react';

import './index.css';

interface Props {
    children?: JSX.Element[];
    // and any html attributes for html form element
}

export default function Form(props: Props) {

    if (!props.children) { // not strictly needed, but gets rid of ts warning
        return;
    }

    const childArr = (props.children.map) ? props.children : [props.children];

    const children = (childArr as JSX.Element[]).map(child => React.cloneElement(child));

    const p = Object.assign({}, props);
    delete p.children;

    return <form {...p}>{children}</form>;
}
