import * as React from 'react';

import './index.css';
import { HTMLProps, ReactNode } from 'react';

export default function Form(props: HTMLProps<HTMLFormElement> & { children?: ReactNode }) {

    if (!props.children) { // not strictly needed, but gets rid of ts warning
        return null;
    }

    const childArr = ((props.children as ReactNode[]).map) ? props.children : [props.children];

    const children = (childArr as JSX.Element[]).map(child => React.cloneElement(child));

    const p = Object.assign({}, props);
    delete p.children;

    return <form {...p}>{children}</form>;
}
