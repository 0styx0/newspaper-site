import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';
import './index.css';
import './tempPolyfills';
import RouterContainer from './components/Router/container';
import ApolloClient from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloProvider } from 'react-apollo';
import { ApolloLink } from 'apollo-link';

const middlewareLink = new ApolloLink((operation, forward) => {

  operation.setContext({
    headers: {
      authorization: `Bearer ${localStorage.getItem('jwt') || ''}`
    },
    method: 'post'
  });
  return forward!(operation);
});

const link = new HttpLink({
  uri: 'http://localhost/graphql',
  credentials: 'include'
});

const client = new ApolloClient({
  link: middlewareLink.concat(link),
  cache: new InMemoryCache({
    dataIdFromObject: (o: { id: string }) => o.id,
    addTypename: true
  // tslint:disable-next-line:no-any
  }) as any,
});

ReactDOM.render((
  <ApolloProvider client={client}>
    <BrowserRouter basename="/">
      <RouterContainer />
    </BrowserRouter>
  </ApolloProvider>
),              document.getElementById('root'));

  // prevents user seeing navbar roll up
Array.from(document.getElementsByTagName('li')).forEach(elt => elt.style.opacity = '0');

window.setTimeout(function() {
    Array.from(document.getElementsByTagName('li')).forEach(elt => elt.style.opacity = '1');
},                700);

registerServiceWorker();
