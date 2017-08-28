import { gql } from 'react-apollo';

const CommentCreate = gql`

    mutation CommentCreate($artId: ID!, $content: String!) {
        createComment(artId: $artId, content: $content) {
            id
        }
    }
`;

export {
    CommentCreate
};