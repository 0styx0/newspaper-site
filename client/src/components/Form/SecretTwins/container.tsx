import * as React from 'react';

import SecretTwins from './'

interface Props {
    original: JSX.Element | Element;
    props: any;
}

interface State {
    className: string;
}

/**
 * Creates 2 inputs - one that's hidden and one that's not, with the same value
 * When the visible one changes, both get the .changed class which allows them to be submitted
 *
 * @prop original - element to copy off of and return together with copy
 * @prop props - json with any extra properties for hidden elt. Must include name
 */
export default class SecretTwinsContainer extends React.Component<Props, State> {

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

        return (
            <SecretTwins
              original={this.props.original as JSX.Element}
              mirror={this.mirror}
              className={this.state.className}
              {...this.props.props}
            />
        );
    }
}
