import gql from 'graphql-tag';

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
            canEdit
        }
    }
`;

const UserUpdate = gql`
    mutation updateUsers($data: [idLevelList], $password: String!) {
        updateUsers(data: $data, password: $password) {
            id
            level
        }
    }
`;

const UserDelete = gql`
    mutation deleteUsers($ids: [ID], $password: String!) {
        deleteUsers(ids: $ids, password: $password) {
            id
        }
    }
`;

export {
    UserQuery,
    UserUpdate,
    UserDelete
};