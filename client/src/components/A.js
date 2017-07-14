import React from 'react';

/**
 * @prop router - the `this of a component in a <Route> (see index.js)
 *
 * @return a link that when clicked, makes react-router switch routes, and so only gets data that's actually needed
 */
function A(props) {

    if (props.router) {
        A.router = props.router; // failsafe attempt
    }

    const link = <a onClick={() => (props.router || A.router).props.history.push(props.href)}>{props.text}</a>

    return React.cloneElement(link, props.props);
}

export default A;