import * as React from 'react';

import Hint from './';

interface Props {
    title: string;
}

interface State {
    reveal: boolean;
}

export default class HintContainer extends React.Component<Props, State> {

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
