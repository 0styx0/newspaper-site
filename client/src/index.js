
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker';

import './index.css';

import RouterContainer from './components/Router/container';


ReactDOM.render((
  <BrowserRouter basename="/">
    <RouterContainer />
  </BrowserRouter>
), document.getElementById('root'))

  // prevents user seeing navbar roll up
  Array.from(document.getElementsByTagName("li")).forEach(elt => elt.style.opacity = "0");

  window.setTimeout(function() {
      Array.from(document.getElementsByTagName("li")).forEach(elt => elt.style.opacity = "1");
  }, 700);


registerServiceWorker();
