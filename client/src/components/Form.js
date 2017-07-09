import React from 'react';


/**
 * @return form with action of props.action, children of props.children, and method of props.method.
 *  NOTE: if a form has inputs which require different REST methods, make the method an array of methods needed,
 * and set each individual input with its own formMethod attr
 */
class Form extends React.Component {

    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);
    }

    onSubmit(event) {


        event.preventDefault();
        event.stopPropagation();
        this.separateData(event.target, event.target.dataset.method);
    }

    /**
     * Separates form elements by method (if needed), then sends to be parsed and ultimately sent to server
     */
    separateData(form) {

        if (Array.isArray(this.props.method)) {

            this.props.method.map(method => form.querySelectorAll(`[formmethod=${method}].changed`))
            .map(elts => Array.from(elts).filter(elt => elt.type !== "checkbox" || elt.checked))
            .forEach((elts, idx) => {

                this.parseData(form, elts, this.props.method[idx])
            });
        }
        else {
            this.parseData(form, form.querySelectorAll(".changed"), this.props.method);
        }

    }

    /**
     * Turns elements into json {name: value} then passes to sendData
     */
    parseData(form, elements, method) {

        // if nothing is selected
        if (elements.length === 0) {
            return;
        }

        const formData = {};

        for (let i = 0; i < elements.length; i++) {

            const elt = elements[i];

            if (elt.name) {

                if (!formData[elt.name] && elt.name.indexOf("[]") !== -1) {
                    formData[elt.name] = []
                }
                if (Array.isArray(formData[elt.name])) {

                    if (elt.multiple) {
                        const selected = Array.from(elt.selectedOptions).map(option => option.value);
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

        const passwordElt = form.querySelector("[type=password]");

        formData.password = (formData.password) ? formData.password : passwordElt.value

        this.sendData(form, formData, method);
    }

    /**
     * Sends data to server, then calls the onSubmit handler that user of component may have attached
     */
    sendData(form, json, method) {

        fetch(form.action, {
            method: method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(json)
        })
        .then(() => {

            for (const elt of document.querySelectorAll('[type=password]')) {
                elt.value = '';
            }
        })
        .then(() => {
            if (this.props.onSubmit) {

                this.props.onSubmit(method, json)
            }
        });

    }

    registerChange(event) {
        event.target.className += ' changed';
    }

    render() {

        return (
            <form action={this.props.action}  onChange={this.registerChange} onSubmit={this.onSubmit} >
                {this.props.children}
            </form>
        )
    }
}

export default Form;