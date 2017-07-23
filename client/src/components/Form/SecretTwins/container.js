import React from 'react';

import PropTypes from 'prop-types';
import SecretTwins from './'

/**
 * Creates 2 inputs - one that's hidden and one that's not, with the same value
 * When the visible one changes, both get the .changed class which allows them to be submitted
 *
 * @prop original - element to copy off of and return together with copy
 * @prop props - json with any extra properties for hidden elt. Must include name
 */
export default class SecretTwinsContainer extends React.Component {

    constructor() {
        super();

        this.mirror = this.mirror.bind(this);

        this.state = {
            className: ''
        }
    }

    mirror() {
        this.setState({className: 'changed'});
    }



    render() {

        return <SecretTwins
                 original={this.props.original}
                 mirror={this.mirror}
                 className={this.state.className}
                 {...this.props.props}
               />
    }
}


SecretTwinsContainer.propTypes = {
    original: PropTypes.element.isRequired,
    props: PropTypes.shape({
        name: PropTypes.string.isRequired,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
}
