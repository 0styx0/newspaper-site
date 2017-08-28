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

const PrivateUserQuery = gql`

    query users($profileLink: String) {
        users(profileLink: $profileLink) {
            notifications
            twoFactor
            email
            id
        }
    }
`;

const UserUpdate = gql`
    mutation updateUser(
        $id: String!, $notificationStatus: boolean, $twoFactor: boolean, $newPassword: String
    ) {
        updateUser(
            notificationStatus: $notificationStatus, twoFactor: $twoFactor, newPassword: $newPassword, id: $id
        ) {
            id
        }
    }
`;

const UserLogin = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            jwt
        }
    }
`;

export {
    UserQuery,
    PrivateUserQuery,
    UserUpdate,
    UserLogin
};