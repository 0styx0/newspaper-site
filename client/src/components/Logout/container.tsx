import * as React from 'react';
import Logout from './';
import cache from '../../apolloCache';

class LogoutContainer extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);

        this.onLogout  = this.onLogout.bind(this);
    }

    removeJwt() {
        window.localStorage.removeItem('jwt');
    }

    clearApolloCache() {
        cache.reset();
    }

    onLogout() {
        this.removeJwt();
        this.clearApolloCache();
    }

    render() {
        return <Logout onLogout={this.onLogout} />;
    }
}

export default LogoutContainer;
