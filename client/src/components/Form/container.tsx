import * as React from 'react';

import Form from './';

interface Props {
    children?: JSX.Element;
}

export default class FormContainer extends React.Component<Props, {}> {

    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);
    }

    /**
     * Intercepts the actual onSubmit handler to stop default form behavior, then passes it back to handler
     */
    onSubmit(event: Event) {

        event.preventDefault();
        event.stopPropagation();

        if (this.props.onSubmit) {
            this.props.onSubmit(event);
        }
    }

    render() {

        const extendableProps = Object.assign({}, this.props);

        return <Form {...Object.assign(extendableProps, {onSubmit: this.onSubmit})} />;
    }
}
