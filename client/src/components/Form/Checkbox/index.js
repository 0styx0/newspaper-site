import React from 'react';

import './index.css';

// Form's onChange doesn't fire if defaultChecked is true and then uncheck box, so creating this
export default class Checkbox extends React.Component {

    constructor() {
        super();

        this.handleToggles = this.handleToggles.bind(this);

        this.state = {
            checked: null
        }
    }

    handleToggles(e) {

        e.target.classList.add("changed")

        this.setState({
            value: e.target.checked ? "true" : ''
        });
    }

    render() {

        const checkbox = React.cloneElement(<input />, this.props);

        return React.cloneElement(checkbox, {
            value: this.state.value,
            onClick: this.handleToggles,
            type: "checkbox"
        });
    }
}

