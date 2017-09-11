import { gql } from 'react-apollo';

const TagQuery = gql`

    query allTags {
        allTags
    }
`;

const TagCreate = gql`

    mutation createTag($tag: String!) {
        createTag(tag: $tag) {
            tag
        }
    }
`;

export {
    TagQuery,
    TagCreate
};
