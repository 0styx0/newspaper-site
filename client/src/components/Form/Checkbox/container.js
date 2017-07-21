import React from 'react';
import PropTypes from 'prop-types';

import Checkbox from './';

// Form's onChange doesn't fire if defaultChecked is true and then uncheck box, so creating this
export default class CheckboxContainer extends React.Component {

    constructor() {
        super();

        this.handleToggles = this.handleToggles.bind(this);

        this.state = {
            checked: null
        }
    }

    /**
     * Gives event target class of changed so can be sent to server (@see FormContainer)
     */
    handleToggles(e) {

        e.target.classList.add("changed")

        this.setState({
            value: e.target.checked ? "checked" : ''
        });
    }

    render() {

        return <Checkbox
                 props={this.props}
                 value={this.state.value}
                 handleToggles={this.handleToggles}
               />
    }
}

CheckboxContainer.propTypes = {
    props: PropTypes.object
}

