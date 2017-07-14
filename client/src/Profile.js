import React from 'react';
import {Container} from './components/Container';
import Form from './components/Form';
import {Input, Checkbox} from './components/Input';
import Table from './components/Table';
import {jwt} from './components/jwt';
import fetchFromApi from './helpers/fetchFromApi';
import { Link } from 'react-router-dom';



class UserArticleTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            articles: this.props.articles
        }
    }

    render() {

        if (!this.state.articles) {
            return <span />; // random useless thing
        }

        const headings = [
            "Article",
            "Published",
            "Type",
            "Views",
        ];

        if (jwt.email === this.props.user) {

            headings.push(<span className="danger">Delete</span>);
        }

        const articles = this.state.articles.map(article => {

            const artInfo = [
                <Link to={`/issue/${article.issue}/story/${article.url}`}>
                    {article.url}
                </Link>,
                article.created,
                article.tags,
                article.views
            ];

            if (jwt.email === this.props.user) {
                artInfo.push(<input type="checkbox" name="delArt[]" value={article.art_id} />);
            }
            return artInfo;
        });

        return (
            <Container
                heading="Articles"
                children={
                    <Form
                        method="delete"
                        action="articleGroup"
                        children={
                            <div>
                                <Table
                                    headings={headings}
                                    rows={articles}
                                />

                                {jwt.email === this.props.user ?
                                    <div>
                                        <Input
                                            label="Password"
                                            props={{
                                                type: "password",
                                                name: "password",
                                                required: true,
                                            }}
                                        />
                                        <input type="submit" />
                                    </div>
                                : ""}
                            </div>
                        }
                    />
                }
            />
        )


    }

}

class ModifiableUserInfo extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            info: this.props.info
        }
    }

    render() {

        if (!this.state.info) {
            return <span />;
        }

        const headings = [
            "Email",
            "2FA",
            "Notifications",
            <span className="danger">Delete Account</span>
        ];

        const row = [
            this.state.info.email,
            <Checkbox
                formMethod="put"
                name="2fa"
                data-pass={this.state.info.twoFactor}
                defaultChecked={this.state.info.twoFactor}
            />,
            <Checkbox
                formMethod="put"
                name="notifications"
                data-pass={this.state.info.notificationStatus}
                defaultChecked={this.state.info.notificationStatus}
            />,
            <input formMethod="delete" type="checkbox" name="delAcc" value={this.state.info.id} />
        ];

        return (
            <Container
                heading="Options"
                className="tableContainer"
                children={
                    <Form
                        method={["put", "delete"]}
                        action="user"
                        children={
                            <div>
                                <Table
                                    headings={headings}
                                    rows={[row]}
                                />
                                <Input
                                    label="Password"
                                    props={{
                                        type: "password",
                                        name: "password",
                                        required: true
                                    }}
                                />
                                <input type="submit" />
                            </div>
                        }

                    />
                }
            />
        )

    }

}

function PublicUserInfo(props) {

    const headingsJSON = props.info;

    if (!headingsJSON.username) {
        delete headingsJSON.username;
    }


    return (
        <Container
            className="tableContainer"
            children={<Table
                headings={Object.keys(headingsJSON)}
                rows={[Object.values(headingsJSON)]}
                />
            }
        />
    );
}

function ChangePassword() {

    return (
        <Container
            heading="Change Password"
            children={
                <Form
                    method="put"
                    action="user"
                    children={
                        <div>
                            <Input
                                label="New Password"
                                props={{
                                    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$",
                                    name: "newPass",
                                    type: "password",
                                    required: true
                                }}

                            />
                            <Input
                                label="Confirm Password"
                                props={{
                                    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$",
                                    name: "passConf",
                                    type: "password",
                                    required: true
                                }}
                            />
                            <Input
                                label="Old Password"
                                props={{
                                    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$",
                                    name: "password",
                                    type: "password",
                                    required: true
                                }}
                            />
                            <input type="submit" value="Change Password" />
                        </div>
                    }
                />
            }
        />
    )
}

class Profile extends React.Component {

    constructor() {
        super();

        this.state = {
            personalInfo: {},
            userInfo: {},
            articleInfo: [],
            user: window.location.pathname.split("/")[2],
            changed: 0
        }
    }

    async componentWillMount() {

        const json = await fetchFromApi(`user?user=${this.state.user}`)
                             .then(data => data.json());

        this.setState({
            userInfo: json[0],
            articleInfo: json[1],
            personalInfo: json[2],
            changed: 1
        })

    }

    render() {

        return (
            <div>
                <PublicUserInfo
                    key={this.state.changed}
                    info={this.state.userInfo}
                />
                <ModifiableUserInfo
                    key={this.state.changed + 1 /*forces update*/}
                    info={this.state.personalInfo}
                />
                {jwt.email === this.state.user ? <ChangePassword /> : ""}
                <UserArticleTable
                    key={this.state.changed + 2 /*forces update*/}
                    user={this.state.user}
                    articles={this.state.articleInfo}
                />
            </div>

        )
    }
}

export default Profile;