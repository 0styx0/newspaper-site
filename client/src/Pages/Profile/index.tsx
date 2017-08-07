import * as React from 'react';
import Container from '../../components/Container';
import FormContainer from '../../components/Form/container';
import Input from '../../components/Form/Input';
import CheckboxContainer from '../../components/Form/Checkbox/container';
import Table from '../../components/Table';
import {jwt} from '../../components/jwt';
import fetchFromApi from '../../helpers/fetchFromApi';
import { Link } from 'react-router-dom';

interface Articles {
    url: string;
    created: Date;
    tags: string;
    views: number;
    issue: number;
    art_id: string;
}

interface Props {
    articles: Articles[];
    user: string;
}

interface State extends Props {

}

class UserArticleTable extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            articles: this.props.articles,
            user: ''
        }
    }

    render() {

        if (!this.state.articles) {
            return <span />; // random useless thing
        }

        const headings: Array<string | JSX.Element> = [
            "Article",
            "Published",
            "Type",
            "Views",
        ];

        if (jwt.email === this.props.user) {

            headings.push(<span className="danger">Delete</span>);
        }

        const articles = this.state.articles.map((article: Articles) => {

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
                    <FormContainer
                        method="delete"
                        action="/api/articleGroup"
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


interface ModifiableInfo {
    email: string;
    twoFactor: boolean;
    notificationStatus: boolean;
    id: string;
}

class ModifiableUserInfo extends React.Component<{info: ModifiableInfo}, {info: ModifiableInfo}> {

    constructor(props: {info: ModifiableInfo}) {
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
            <CheckboxContainer
                props={{
                    formMethod: "put",
                    name: "2fa",
                    "data-pass": this.state.info.twoFactor,
                    defaultChecked: this.state.info.twoFactor
                }}
            />,
            <CheckboxContainer
                props={{
                    formMethod: "put",
                    name: "notifications",
                    "data-pass": this.state.info.notificationStatus,
                    defaultChecked: this.state.info.notificationStatus
                }}
            />,
            <input formMethod="delete" type="checkbox" name="delAcc" value={this.state.info.id} />
        ];

        return (
            <Container
                heading="Options"
                className="tableContainer"
                children={
                    <FormContainer
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

}


function PublicUserInfo(props: {info: ModifiableInfo}) {

    const headingsJSON = props.info;

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
                <FormContainer
                    method="put"
                    action="/api/user"
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

interface ProfileState {
    personalInfo: ModifiableInfo | {};
    userInfo: {
        username: string;
        name: string;
        level: number;
        articles: string[];
        views: number;
    } | {};
    articleInfo: [Articles] | never[];
    user: string;
    changed: number;
}

class Profile extends React.Component<{}, ProfileState> {

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
                             .then((data: any) => data.json());

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
                    info={this.state.userInfo as ModifiableInfo}
                />
                <ModifiableUserInfo
                    key={this.state.changed + 1 /*forces update*/}
                    info={this.state.personalInfo as ModifiableInfo}
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