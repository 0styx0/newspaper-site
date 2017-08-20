import * as React from 'react';
import { UserQuery } from '../../graphql/user';
import { graphql, compose } from 'react-apollo';
import PublicUserInfoComponent from './PublicUserInfo';
import ModifiableUserInfo from './ModifiableUserInfo/container';
// import UserArticleTable from './ArticleTable/container';
// import ChangePassword from './ChangePassword/container';

import { Article, PublicUserInfo } from './shared.interfaces';

// import { getJWT } from '../../components/jwt';

interface Props {
    data: {
        users: {
            articles: Article[];
        } & PublicUserInfo
    };
}

function Profile(props: Props) {

    if (!props.data.users) {
        return null;
    }

    const articles = props.data.users[0].articles as Article[];
    const user = props.data.users[0] as PublicUserInfo;

    return (
        <div>
            <PublicUserInfoComponent
                name={user.fullName}
                level={user.level}
                views={user.views}
                articles={articles.length}
            />
            <ModifiableUserInfo />
          {/*  {getJWT().email === props.data.users[0].profileLink ? <ChangePassword /> : ''}
            <UserArticleTable
                articles={props.data.users[0].articles}
                user={props.data.users[0]}
            />*/}
        </div>
    );
}

const ProfileWithData = compose(
    graphql(UserQuery, {
        options: {
            variables: {
                profileLink: 'meiselesd2018'
            }
        }
    } as any) as any
)(Profile);

export default ProfileWithData;