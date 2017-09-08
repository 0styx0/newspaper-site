import { gql } from 'react-apollo';

const TagQuery = gql`

    query allTags {
        allTags
    }
`;

export {
    TagQuery
};
