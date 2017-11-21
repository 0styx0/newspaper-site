import * as React from 'react';
import PublicUserInfoComponent from './PublicUserInfo';
import ModifiableUserInfo from './ModifiableUserInfo/container';
import UserArticleTable from './ArticleTable/container';
import ChangePassword from './ChangePassword/container';

import { Article, PublicUserInfo } from './shared.interfaces';
import { getJWT } from '../../helpers/jwt/index';

interface Props {
    articles: Article[];
    user: PublicUserInfo;
}

function Profile(props: Props) {

    if (!props.user) {
        return null;
    }

    const viewingOwnProfile = props.user.id === getJWT().id;
    
    return (
        <div>
            <PublicUserInfoComponent
                name={props.user.fullName}
                level={props.user.level}
                views={props.user.views}
                articles={props.articles.length}
            />
            {viewingOwnProfile ? <ModifiableUserInfo /> : ''}
            {viewingOwnProfile ? <ChangePassword /> : ''}
            <UserArticleTable
                articles={props.articles}
            />
        </div>
    );
}

export default Profile;
