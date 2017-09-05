import * as React from 'react';

import { getJWT } from '../jwt';
import Router from './';

export default class RouterContainer extends React.Component<{}, {}> {

    componentWillUpdate() {
        // so rolled down navar won't be there after clicking link
        (document.getElementById('menuToggle') as HTMLInputElement)!.checked = false;
    }

    render() {

        const jwt = getJWT();

        return <Router key={jwt.id} />;
    }
}
