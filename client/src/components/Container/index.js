import React from 'react';
import PropTypes from 'prop-types';

import './index.css';


export default function Container(props) {

        const className = `container ${props.className || ''}`;

        return (
            <section className={className}>
                <h1>{props.heading}</h1>
                {props.children}
            </section>
        )
}

Container.propTypes = {

    heading: PropTypes.string,
    className: PropTypes.string, // in addition to the default `container` class if wanted
    children: PropTypes.node.isRequired
}
