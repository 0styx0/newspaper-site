
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker';

import './index.css';

import RouterContainer from './components/Router/container';

import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';

const networkInterface = createNetworkInterface({
  uri: 'http://localhost/graphql',
  opts: {
    credentials: 'include'
  }
});

networkInterface.use([{
  applyMiddleware(req: any, next: Function) {

    if (!req.options.headers) {

      req.options.headers = new Headers();  // Create the header object if needed.
    }
    // get the authentication token from local storage if it exists
    req.options.headers.Authorization =  `Bearer ${localStorage.getItem('jwt') || ''}`;

    next();
  }
}]);

const client = new ApolloClient({
  networkInterface,
  dataIdFromObject: (o: {id: string}) => o.id
});

ReactDOM.render((
  <ApolloProvider client={client as any}>
    <BrowserRouter basename="/">
      <RouterContainer />
    </BrowserRouter>
  </ApolloProvider>
), document.getElementById('root'))

  // prevents user seeing navbar roll up
  Array.from(document.getElementsByTagName("li")).forEach(elt => elt.style.opacity = "0");

  window.setTimeout(function() {
      Array.from(document.getElementsByTagName("li")).forEach(elt => elt.style.opacity = "1");
  }, 700);


registerServiceWorker();
