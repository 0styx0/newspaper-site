import { gql } from 'react-apollo';

const UserQuery = gql`
    query users {
        users {
            articleCount
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

const UserUpdate = gql`
    mutation updateUsers($data: [IdLevelList]) {
        updateUsers(data: $data) {
            id
            profileLink
            level
        }
    }
`;

const UserDelete = gql`
    mutation deleteUsers($ids: [ID]) {
        deleteUsers(ids: $ids) {
            id
        }
    }
`;

export {
    UserQuery,
    UserUpdate,
    UserDelete
};