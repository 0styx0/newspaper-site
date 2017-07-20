import React from 'react';
import Login from '../../Pages/Login';
import Logout from '../Logout';
import Signup from '../../Pages/Signup';
import JournalistTable from '../../Pages/JournalistTable';
import IssueTable from '../../Pages/IssueTable';
import ArticleTable from '../../Pages/ArticleTable';
import Publish from '../../Pages/Publish';
import Profile from '../../Pages/Profile';
import MainPage from '../../Pages/MainPage';
import Mission from '../../Pages/Mission';
import Story from '../../Pages/Story';
import ForgotPassword from '../../Pages/ForgotPassword';
import TwoFactor from '../../Pages/TwoFactor';
import TagSelect from '../TagSelect';
import { Link, Route, Switch } from 'react-router-dom'
import {jwt} from '../jwt';
import fetchFromApi from '../../helpers/fetchFromApi';

import './index.css';


export default class Router extends React.Component {

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

        return (
        <div>
            <nav>

                <ul key={this.state.jwt}>
                    {/*for responsiveness */}
                    <label htmlFor='menuToggle'>
                    <span className="container" />
                        <li className='showMenu hidden'> ||| </li>
                    </label>
                    <input id='menuToggle' tabIndex="-1" type='checkbox' />

                    <li><Link to="/">Home</Link></li>
                    <li><TagSelect /></li>
                    {jwt.level ? "" : <li><Link to="/login">Login</Link></li>}
                    <li><Link to="/signup">Create Account</Link></li>
                    <li><Link to="/u">Journalists</Link></li>
                    <li><Link to="/mission">Mission</Link></li>
                    <li><Link to="/issue">Issues</Link></li>
                    {jwt.level ? <li><Link to="/modifyArticles">Articles</Link></li> : ""}
                    {jwt.level ? <li><Link to="/publish">Publish</Link></li> : ""}
                    {jwt.level ? <li id="logout"><Logout /></li>
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
                <Route path="/authLogin" component={TwoFactor}/>
                <Route path="/forgotPass" component={ForgotPassword}/>

            </Switch>
        </div>
        );
    }
}
