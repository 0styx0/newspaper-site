import React from 'react';
import ReactDOM from 'react-dom';
import Login from './Login';
import Signup from './Signup';
import JournalistTable from './JournalistTable';
import IssueTable from './IssueTable';
import ArticleTable from './ArticleTable';
import Publish from './Publish';
import Profile from './Profile';
import MainPage from './MainPage';
import Mission from './Mission';
import Story from './Story';
import TagSelect from './components/TagSelect';
import Form from './components/Form';
import './stormStyles.css';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom'
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
            <li><Link to="/">Home</Link></li>
            <li><TagSelect /></li>
            {jwt.level ? "" : <li><Link to="/login">Login</Link></li>}
            <li><Link to="/signup">Create Account</Link></li>
            <li><Link to="/u">Journalists</Link></li>
            <li><Link to="/mission">Mission</Link></li>
            <li><Link to="/issue">Issues</Link></li>
            {jwt.level ? <li><Link to="/modifyArticles">Articles</Link></li> : ""}
            {jwt.level ? <li><Link to="/publish">Publish</Link></li> : ""}
            {jwt.level ? <li id="logout">
                             <Form
                                  method="put"
                                  action="/api/userStatus"
                                   children={<input className="changed" id="logoutInpt" type="submit" name="logout" value="Log Out" />}
                             />
                         </li>
                        : ""}
            {jwt.level ? <li className="profile"><Link to={`/u/${jwt.email}`}>Profile</Link></li> : ""}
        </ul>
    </nav>
    <Switch>
        <Route path="/login" component={Login}/>
        <Route path="/signup" component={Signup}/>
        <Route exact path="/u" component={JournalistTable}/>
        <Route path="/mission" component={Mission}/>
        <Route exact path="/issue" component={IssueTable}/>
        {jwt.level ? <Route path="/modifyArticles" component={ArticleTable}/> : ""}
        {jwt.level ?  <Route path="/publish" component={Publish} /> : ""}
        <Route path="/issue/(.*)/story/(.*)" component={Story}/>
        <Route path="/tag/(.*)" component={MainPage}/>
        <Route path="/issue/(.*)" component={MainPage}/>
        <Route exact path="/" component={MainPage}/>
        <Route path="/u/(.*)" component={Profile}/>

    </Switch>
  </div>
);

function render() {
  ReactDOM.render((
    <BrowserRouter basename="/">
      <App/>
    </BrowserRouter>
  ), document.getElementById('root'))
}

registerServiceWorker();
