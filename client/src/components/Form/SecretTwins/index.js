import React from 'react';

import './index.css';

/**
 * Creates 2 inputs - one that's hidden and one that's not, with the same value
 * When the visible one changes, both get the .changed class which allows them to be submitted
 *
 * @prop original - element to copy off of and return together with copy
 * @prop props - json with any extra properties for hidden elt. Must include name
 */
export default class SecretTwins extends React.Component {

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

        const original = React.cloneElement(this.props.original, {onChange: this.mirror});

        const originProps = this.props.original.props;

        const copy = <input
                        type="hidden"
                        name={this.props.name}
                        value={this.props.value || originProps.value}
                        formMethod={originProps.formMethod}
                        className={this.state.className}
                      />

        const copyWithCustom = React.cloneElement(copy, this.props.props);

        return (
            <div>
                {original}
                {copyWithCustom}
            </div>
        )
    }
}