import { gql } from 'react-apollo';

const UserQuery = gql`

    query users($profileLink: String) {
        users(profileLink: $profileLink) {
            articles {
                id
                url
                dateCreated
                tags {
                    all
                }
                views
                issue
            }
            views
            level
            id
            fullName
        }
    }
`;

const UserUpdate = gql`
    mutation updateUser(
        id: String!, $notificationStatus: boolean, $twoFactor: boolean, $newPassword: String
    ) {
        updateUser(
            notificationStatus: $notificationStatus, twoFactor: $twoFactor, newPassword: $newPassword, id: $id
        ) {
            id
        }
    }
`;

export {
    UserQuery,
    UserUpdate
};