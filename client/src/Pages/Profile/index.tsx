import * as React from 'react';
import PublicUserInfoComponent from './PublicUserInfo';
import ModifiableUserInfo from './ModifiableUserInfo/container';
import UserArticleTable from './ArticleTable/container';
import ChangePassword from './ChangePassword/container';

import { Article, PublicUserInfo } from './shared.interfaces';

interface Props {
    articles: Article[];
    user: PublicUserInfo;
}

function Profile(props: Props) {

    if (!props.user) {
        return null;
    }

    return (
        <div>
            <PublicUserInfoComponent
                name={props.user.fullName}
                level={props.user.level}
                views={props.user.views}
                articles={props.articles.length}
            />
            <ModifiableUserInfo />
            {props.user.canEdit ? <ChangePassword /> : ''}
            <UserArticleTable
                articles={props.articles}
            />
        </div>
    );
}

export default Profile;
