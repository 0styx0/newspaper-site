import * as React from 'react';
import Form from './';
import {  FormEvent, HTMLProps } from 'react';

interface Props extends HTMLProps<HTMLFormElement> {
    onSubmit(target: HTMLFormElement, e: FormEvent<HTMLFormElement>): void;
    // this line is purely to get rid of incorrect extension of interface
    onSubmit(event: FormEvent<HTMLFormElement>): void;
}

/**
 * Intercepts onSubmit event to prevent default behaviour. For more, @see #onSubmit
 */
// tslint:disable-next-line:no-any (only should use Props first onSubmit but can't get it to work)
export default class FormContainer extends React.Component<Props & any, {}> {

    constructor(props: Props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);
    }

    /**
     * Intercepts the actual onSubmit handler to stop default form behavior, then passes it back to handler
     *  with params (event.target, event)
     */
    onSubmit(event: FormEvent<HTMLFormElement>) {

        event.preventDefault();
        event.stopPropagation();

        if (this.props.onSubmit) {
            this.props.onSubmit(event.target as HTMLFormElement, event);
        }
    }

    render() {

        return <Form {...this.props} onSubmit={this.onSubmit} />;
    }
}
