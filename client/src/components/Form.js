import React from 'react';


/**
 * @return form with action of props.action and children of props.children
 */
class Form extends React.Component {


    onSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    render() {

        return (
            <form action={this.props.action} onSubmit={this.onSubmit} >
                {this.props.children}
            </form>
        )
    }
}

export default Form;