import React from 'react';
import PropTypes from 'prop-types';

import Hint from './';

export default class HintContainer extends React.Component {

    constructor() {
        super();

        this.state = {
            reveal: false
        };
    }

    render() {
        return <Hint
                 onClick={() => this.setState({reveal: !this.state.reveal})}
                 title={this.props.title}
                 revealHint={this.state.reveal}
               />
    }
}

HintContainer.propTypes = {
    title: PropTypes.string.isRequired
}
