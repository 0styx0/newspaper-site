import React from 'react';

import fetchFromApi from '../../helpers/fetchFromApi';

import {jwt} from '../jwt';
import Router from './';



export default class RouterContainer extends React.Component {

    constructor() {
        super();

        this.state = {
            jwt: {}
        }
    }

    componentWillUpdate() {
        // so rolled down navar won't be there after clicking link
        document.getElementById("menuToggle").checked = false;
    }

    componentWillMount() {

        fetchFromApi('userStatus')
        .then(data => data)
        .then(data => data.json())
        .then(json => {
            jwt.level = +json.level
            jwt.email = json.email
            jwt.id = json.id

            this.setState({jwt});
        });
    }

    render() {

        return <Router key={jwt} />
    }
}
