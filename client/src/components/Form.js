import React from 'react';


/**
 * @return form with action of props.action and children of props.children
 */
class Form extends React.Component {

    constructor() {
        super();

        this.onSubmit = this.onSubmit.bind(this);
    }
    onSubmit(event) {

        event.preventDefault();
        event.stopPropagation();

        const formData = {};

        for (let i = 0; i < event.target.elements.length; i++) {

            const elt = event.target.elements[i];

            if (elt.name) {
                formData[elt.name] = elt.value;
            }

        }

        fetch(event.target.action, {
            method: event.target.dataset.method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        }).then(this.props.onSubmit);

    }

    render() {

        return (
            <form action={this.props.action} data-method={this.props.method} onSubmit={this.onSubmit} >
                {this.props.children}
            </form>
        )
    }
}

export default Form;