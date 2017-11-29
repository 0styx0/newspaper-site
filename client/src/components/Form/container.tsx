import * as React from 'react';

import Form from './';

type Props = any;

/**
 * Intercepts onSubmit event to prevent default behaviour. For more, @see #onSubmit
 */
export default class FormContainer extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
    }

    /**
     * Intercepts the actual onSubmit handler to stop default form behavior, then passes it back to handler
     *  with params (event.target, event)
     */
    onSubmit(event: Event) {

        event.preventDefault();
        event.stopPropagation();

        if (this.props.onSubmit) {
            this.props.onSubmit(event.target, event);
        }
    }

    render() {

        return <Form {...this.props} onSubmit={this.onSubmit} />;
    }
}
