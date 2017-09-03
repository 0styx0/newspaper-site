import { gql } from 'react-apollo';

const CommentCreate = gql`

    mutation CommentCreate($artId: ID!, $content: String!) {
        createComment(artId: $artId, content: $content) {
            id
        }
    }
`;

const CommentDelete = gql`

    mutation CommentDelete($id: ID!) {
        deleteComment(id: $id) {
            id
        }
    }
`;

export {
    CommentCreate,
    CommentDelete
};