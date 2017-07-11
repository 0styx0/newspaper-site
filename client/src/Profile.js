import React from 'react';
import {Container} from './components/Container';
import Form from './components/Form';
import {Input, Checkbox} from './components/Input';
import Table from './components/Table';
import {jwt} from './components/jwt';


class UserArticleTable extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            articles: this.props.articleInfo
        }
    }

    render() {

        if (!this.state.articles) {
            return;
        }

        const headings = [
            "Article",
            "Published",
            "Type",
            "Views",
            <span className="danger">Delete</span>
        ];

        const articles = this.state.articles.map(article => [
            <a href={`/issue/${article.issue}/story/${article.url}`}>{decodeURIComponent(article.url)}</a>,
            article.created,
            article.tags,
            article.views,
            jwt.email === this.state.user ? <input type="checkbox" name="delArt[]" value={article.art_id} /> : null
        ]);

        return (
            <Container
                heading="Articles"
                children={
                    <Form
                        method="delete"
                        action="/api/articleGroup"
                        children={
                            <div>
                                <Table
                                    headings={headings}
                                    rows={articles}
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

class Profile extends React.Component {

    constructor() {
        super();

        this.state = {
            personalInfo: {},
            userInfo: {},
            articleInfo: [],
            user: window.location.pathname.split("/")[2]
        }
    }

    async componentWillMount() {

        const json = await fetch(`/api/user?user=${this.state.user}`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(data => data.json());

        this.setState({
            userInfo: json[0],
            articleInfo: json[1],
            personalInfo: json[2]
        })

    }

    renderPublicUserInfo() {

        return (
            <Container
                className="tableContainer"
                children={<Table
                    headings={Object.keys(this.state.userInfo)}
                    rows={[Object.values(this.state.userInfo)]}
                    />
                }
            />
        );
    }

    renderPersonalInfo() {

        const info = this.state.personalInfo;

        if (!info) {
            return;
        }

        const headings = [
            "Email",
            "2FA",
            "Notifications",
            <span className="danger">Delete Account</span>
        ];

        const row = [
            info.email,
            <Checkbox
                formMethod="put"
                name="2fa"
                defaultChecked={info.twoFactor}
            />,
            <Checkbox
                formMethod="put"
                name="notifications"
                defaultChecked={info.notificationStatus}
            />,
            <input formMethod="delete" type="checkbox" name="delAcc" value={info.id} />
        ];

        return (
            <Container
                heading="Options"
                className="tableContainer"
                children={
                    <Form
                        method={["put", "delete"]}
                        action="/api/user"
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


    render() {
        return (
            <div>
                {this.renderPublicUserInfo()}
                {this.renderPersonalInfo()}
                <UserArticleTable articles={this.props.articleInfo}/>
            </div>

        )
    }
}

export default Profile;