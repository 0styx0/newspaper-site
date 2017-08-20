import * as React from 'react';
import { UserQuery } from '../../graphql/user';
import { graphql, compose } from 'react-apollo';

interface ProfileState {
    idsToDelete: Set<string>;
}


interface Props {
    fullName: string;
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
                    info={this.state.userInfo}
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