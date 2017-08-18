import * as React from 'react';
import Container from '../../components/Container';
import Input from '../../components/Form/Input';
import Table from '../../components/Table';
import { UserQuery } from '../../graphql/user';
import { graphql, withApollo } from 'react-apollo';




function PublicUserInfo(props: {info: ModifiableInfo}) {

    const headingsJSON = props.info;

    return (
        <Container
            className="tableContainer"
            children={
                <Table
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
                <form>
                    <Input
                        label="New Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'newPass',
                            type: 'password',
                            required: true
                        }}

                    />
                    <Input
                        label="Confirm Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'passConf',
                            type: 'password',
                            required: true
                        }}
                    />
                    <Input
                        label="Old Password"
                        props={{
                            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*).{6,}$',
                            name: 'password',
                            type: 'password',
                            required: true
                        }}
                    />
                    <input type="submit" value="Change Password" />
                </form>
            }
        />
    );
}

interface ProfileState {
    idsToDelete: Set<string>;
}

class Profile extends React.Component<{}, ProfileState> {

    private jwt = window.localStorage.getItem('jwt') ?
                JSON.parse(window.localStorage.getItem('jwt') as string)[1] :
                {level: 0};

    constructor() {
        super();
    }

    async componentWillMount() {

        const json = await fetchFromApi(`user?user=${this.state.user}`)
                             .then((data: any) => data.json());

        this.setState({
            userInfo: json[0],
            articleInfo: json[1],
            personalInfo: json[2],
            changed: 1
        });

    }

    render() {

        return (
            <div>
                <PublicUserInfo
                    key={this.state.changed}
                    info={this.state.userInfo as ModifiableInfo}
                />
                <ModifiableUserInfo
                    key={this.state.changed + 1/*forces update*/}
                    info={this.state.personalInfo as ModifiableInfo}
                />
                {this.jwt.email === this.state.user ? <ChangePassword /> : ''}
                <UserArticleTable
                    key={this.state.changed + 2/*forces update*/}
                    user={this.state.user}
                    articles={this.state.articleInfo}
                    onDelete={this.onDelete}
                />
            </div>

        );
    }
}

const ProfileWithData = compose(
    graphql(UserQuery)
)(Profile);

export default ProfileWithData;