import * as React from 'react';
import { Link, Route, Switch } from 'react-router-dom'

import Login from '../../Pages/Login';
import Logout from '../Logout';
import Signup from '../../Pages/Signup';
import JournalistTable from '../../Pages/JournalistTable';
import IssueTable from '../../Pages/IssueTable';
import ArticleTableContainer from '../../Pages/ArticleTable/container';
import Publish from '../../Pages/Publish';
import ProfileContainer from '../../Pages/Profile/container';
import MainPage from '../../Pages/MainPage';
import MissionContainer from '../../Pages/Mission/container';
import Story from '../../Pages/Story';
import ForgotPassword from '../../Pages/ForgotPassword';
import TwoFactor from '../../Pages/TwoFactor';
import SelectTagPreview from '../TagSelect/SelectTagPreview';

import { getJWT } from '../jwt';

import './index.css';

export default function Router() {

    const jwt = getJWT();

    return (
        <div>
            <nav>

                <ul key={jwt.id}>
                    {/*for responsiveness */}
                    <label htmlFor='menuToggle'>
                    <span className="container" />
                        <li className='showMenu hidden'> ||| </li>
                    </label>
                    <input id='menuToggle' tabIndex={-1} type='checkbox' />

                    <li><Link to="/">Home</Link></li>
                    <li><SelectTagPreview /></li>
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
                <Route path="/mission" component={MissionContainer}/>
                <Route exact path="/issue" component={IssueTable}/>
                {jwt.level ? <Route path="/modifyArticles" component={ArticleTableContainer}/> : ""}
                {jwt.level ?  <Route path="/publish" component={Publish} /> : ""}
                <Route path="/issue/(.*)/story/(.*)" component={Story}/>
                <Route path="/tag/(.*)" component={MainPage}/>
                <Route path="/issue/(.*)" component={MainPage}/>
                <Route exact path="/" component={MainPage}/>
                <Route path="/u/(.*)" component={ProfileContainer}/>
                <Route path="/authLogin" component={TwoFactor}/>
                <Route path="/forgotPass" component={ForgotPassword}/>

            </Switch>
        </div>
        );
}