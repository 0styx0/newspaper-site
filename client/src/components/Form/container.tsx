import * as React from 'react';
import httpNotification from '../../helpers/Notification';

import Form from './';

interface Props {
    method: string | string[];
    action: string;
    children: JSX.Element,
    onSubmit?: Function;
};

/**
 * @return form with action of props.action, children of props.children, and method of props.method.
 *  NOTE: if a form has inputs which require different REST methods, make the method an array of methods needed,
 * and set each individual input with its own formMethod attr
 */
export default class FormContainer extends React.Component<Props, {}> {

    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event: Event) {


        event.preventDefault();
        event.stopPropagation();
        this.separateData(event.target as HTMLFormElement);
    }

    /**
     * Separates form elements by method (if needed), then sends to be parsed and ultimately sent to server
     */
    separateData(form: HTMLFormElement) {

        if (Array.isArray(this.props.method)) {

            this.props.method.map((method: string) => form.querySelectorAll(`[formmethod=${method}].changed`))
            .map((elts: NodeListOf<HTMLInputElement>) => Array.from(elts).filter(elt => {
                return elt.type !== "checkbox" || elt.checked || 'pass' in elt.dataset
            }))
            .forEach((elts: HTMLInputElement[], idx: number) => this.parseData(form, elts, this.props.method[idx]));
        }
        else {
            this.parseData(form, Array.from(form.querySelectorAll(".changed")) as HTMLInputElement[], this.props.method);
        }

    }

    /**
     * Turns elements into json {name: value} then passes to sendData
     */
    parseData(form: HTMLFormElement,
              elements: Array<HTMLInputElement | HTMLSelectElement>,
              method: string) {

        // if nothing is selected
        if (elements.length === 0) {
            return;
        }

        const formData: {password?: string} = {};

        for (let i = 0; i < elements.length; i++) {

            const elt = elements[i];

            if (elt.name) {

                if (!formData[elt.name] && elt.name.indexOf("[]") !== -1) {
                    formData[elt.name] = []
                }
                if (Array.isArray(formData[elt.name])) {

                    // 2d array for /modifyArticles, but not for /publish
                    if (elt.multiple && form.querySelectorAll("select[multiple]").length > 1) {
                        const selected = Array.from((elt as HTMLSelectElement).selectedOptions).map(option => option.value);
                        formData[elt.name].push(selected);
                    }
                    else {
                        // in ArticleTable 2 artId named inputs with same value so that id will be submitted with display order and tags
                        if (formData[elt.name].indexOf(elt.value) === -1) {
                            formData[elt.name].push(elt.value);
                        }
                    }
                }
                else {

                    formData[elt.name] = elt.value;
                }
            }
        }

        const passwordElt = form.querySelector("[type=password]") as HTMLInputElement;

        if (formData.password || passwordElt) {

            formData.password = (formData.password) ? formData.password : passwordElt.value
        }

        this.sendData(form, formData, method);
    }

    /**
     * Sends data to server, then calls the onSubmit handler that user of component may have attached
     */
    async sendData(form: HTMLFormElement, json: Object, method: string) {

        fetch(form.action, {
            credentials: "include",
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
         })
        .then((data: {status: number; statusText: string; headers: {get: Function}; json: Function}) => {

            httpNotification(data.statusText, data.status);

            if (this.props.onSubmit) {

                this.props.onSubmit(method, json, data);
            }


            return data.headers.get("content-length") > 0 && data.json();
        });

        // shouldn't need Array.from, but typescript throws error
        for (const elt of Array.from(document.querySelectorAll('[type=password]')) as HTMLInputElement[]) {
            elt.value = '';
        }
    }

    onChange(event: Event) {

        (event.target as HTMLElement).classList.add('changed');
    }

    render() {
        return <Form
                 props={{
                    action: this.props.action,
                    onChange: this.onChange,
                    onSubmit: this.onSubmit,
                 }}
                 children={this.props.children}
               />
    }
}
