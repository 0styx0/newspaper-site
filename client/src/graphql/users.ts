import { gql } from 'react-apollo';

const UserQuery = gql`
    query users {
        users {
            articles
            views
            level
            id
            profileLink
            firstName
            middleName
            lastName
        }
    }
`;

const UserUpdate= gql`
    mutation updateUsers($data: [IdLevelList]) {
        updateUsers(data: $data) {
            id
            profileLink
            level
        }
    }
`;

export {
    UserQuery,
    UserUpdate
}