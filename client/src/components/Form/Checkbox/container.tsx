import * as React from 'react';

import Checkbox from './';

interface Props {
    props?: Object;
}

interface State {
    value: 'checked' | '';
}

// Form's onChange doesn't fire if defaultChecked is true and then uncheck box, so creating this
export default class CheckboxContainer extends React.Component<Props, State> {

    constructor() {
        super();

        this.handleToggles = this.handleToggles.bind(this);

        this.state = {
            value: ''
        }
    }

    /**
     * Gives event target class of changed so can be sent to server (@see FormContainer)
     */
    handleToggles(e: Event) {

        const elt = e.target as HTMLInputElement;

        elt.classList.add("changed");

        this.setState({
            value: elt.checked ? "checked" : ''
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
