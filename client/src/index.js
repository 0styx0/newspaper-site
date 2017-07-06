import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Login';
import Signup from './Signup';
import JournalistTable from './JournalistTable';
import './stormStyles.css';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Link, Route } from 'react-router-dom'
import {jwt} from './components/jwt';

(function() {
        fetch('http://localhost:3000/api/userStatus', {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    }
        }).then(data => data)
        .then(data => data.json())
        .then(json => {
            jwt.level = +json.level
            jwt.email = json.email
            jwt.id = json.id
        }).then(render, render);

}());


const App = () => (
  <div>
    <nav>

        <ul>
            <li><Link to="./">Home</Link></li>
            <li><Link to="./login">Login</Link></li>
            <li><Link to="./signup">Signup</Link></li>
            <li><Link to="./u">Journalists</Link></li>
        </ul>
    </nav>
    <div>
      <Route path="/login" component={Login}/>
      <Route path="/signup" component={Signup}/>
      <Route path="/u" component={JournalistTable}/>

    </div>
  </div>
);

function render() {
  ReactDOM.render((
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  ), document.getElementById('root'))
}

registerServiceWorker();
