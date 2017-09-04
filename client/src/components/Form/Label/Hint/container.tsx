import * as React from 'react';

import Hint from './';

interface Props {
    title: string;
    children: JSX.Element;
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

        const children = React.cloneElement(this.props.children, {
            onInput: (e: Event) => this.setState({
                reveal: !(e.target as HTMLInputElement).checkValidity()
            })
        });

        return (
            <Hint
              onClick={() => this.setState({reveal: !this.state.reveal})}
              title={this.props.title}
              revealHint={this.state.reveal}
              children={children}
            />
        );
    }
}
