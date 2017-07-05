import React from 'react';

let jwt = {};

function Heading(props) {

    return (
        <h1>{props.text}</h1>
    )
}


class Container extends React.Component {

    async getCookies() {

        const call = await fetch('http://localhost:3000/api/userStatus', {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        return call.json();
    }

    render() {

        jwt = this.getCookies();

        return (
            <section className="container">
                <Heading text={this.props.heading} />
                 {this.props.children}
            </section>
        )
    }

}

export {Container, jwt};