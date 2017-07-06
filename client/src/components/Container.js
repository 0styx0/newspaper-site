import React from 'react';

function Heading(props) {

    return (
        <h1>{props.text}</h1>
    )
}


class Container extends React.Component {

    render() {

        return (
            <section className="container">
                <Heading text={this.props.heading} />
                 {this.props.children}
            </section>
        )
    }

}

export {Container};