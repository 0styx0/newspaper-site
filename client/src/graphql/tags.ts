import { gql } from 'react-apollo';

const TagQuery = gql`

    query tagQuery {
        tags {
            tags
        }
    }
`;

export {
    TagQuery
};
