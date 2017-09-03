import * as React from 'react';

import './index.css';

interface Props {
    heading?: string;
    className?: string; // in addition to the default `container` class if wanted
    children?: JSX.Element | Element;
}

// tested as part of many other components/pages
export default function Container(props: Props) {

        const className = `container ${props.className || ''}`;

        return (
            <section className={className}>
                <h1>{props.heading}</h1>
                {props.children}
            </section>
        );
}
