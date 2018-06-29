import * as React from 'react';
import { UserQuery } from '../../graphql/user';
import { graphql, compose, withApollo } from 'react-apollo';
import Profile from './';
import { Article, PublicUserInfo } from './shared.interfaces';

interface Props {
    data: {
        users: {
            articles: Article[];
        } & PublicUserInfo
    };
    client: {
        query: ( params: { query: typeof UserQuery, variables: { profileLink: string; } } ) => Promise<Props>;
    };
}

interface State {
    articles: Article[];
    user: PublicUserInfo;
}

class ProfileContainer extends React.Component<Props, State> {

    public state: State;

    constructor(props: Props) {
        super(props);

        this.state = {
            user: {} as PublicUserInfo,
            articles: [] as Article[]
        };

    }

    async componentWillMount() {

        const path = window.location.pathname.split('/');

        const { data } = await this.props.client.query({
            query: UserQuery,
            variables: {
                profileLink: path[path.length - 1]
            }
        });

        this.setState({
            user: data.users[0],
            articles: data.users[0].articles
        });
    }

    render() {

        if (!this.state.user) {
            return null;
        }

        const articles = this.state.articles as Article[];
        const user = this.state.user as PublicUserInfo;

        return (
            <Profile
                articles={articles}
                user={user}
            />
        );
    }
}

const ProfileContainerWithData = compose(
    graphql(UserQuery, {
        options: {
            variables: {
                profileLink: window.location.pathname.split('/')[window.location.pathname.split('/').length - 1]
            }
        }
    })
)(ProfileContainer);

export default withApollo(ProfileContainerWithData as any) as any;
