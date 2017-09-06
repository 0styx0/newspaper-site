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
                canEdit
            }
            views
            level
            id
            fullName
            canEdit
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
    mutation updateProfile(
        $id: String!, $notificationStatus: boolean, $twoFactor: boolean, $newPassword: String
    ) {
        updateUser(
            notificationStatus: $notificationStatus, twoFactor: $twoFactor, newPassword: $newPassword, id: $id
        ) {
            id
        }
    }
`;

const RecoverPassword = gql`
    mutation recoverPassword($email: String!, $authCode: String!, $username: String!) {
        recoverPassword(email: $email, authCode: $authCode, username: $username) {
            message
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

// to be used only after user is logged in
const UserVerifyEmail = gql`
    mutation verifyEmail($authCode: String!) {
        verifyEmail(authCode: $authCode) {
            jwt
        }
    }
`;

const UserCreate = gql`
    mutation createUser(
        $username: String!,
        $email: String!,
        $level: Int,
        $firstName: String!,
        $middleName: String,
        $lastName: String!,
        $password: String!) {

            createUser(
                username: $username,
                email: $email,
                level: $level,
                firstName: $firstName,
                middleName: $middleName,
                lastName: $lastName,
                password: $password
            ) {
                id
            }
        }
`;

export {
    UserQuery,
    PrivateUserQuery,
    UserUpdate,
    UserLogin,
    RecoverPassword,
    UserCreate,
    UserVerifyEmail
};