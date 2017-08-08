import { gql } from 'react-apollo';


const IssueQuery = gql`
    query IssueQuery {
        issues {
            num
            name
            views
            datePublished
            public
        }
    }
`;

const IssueUpdate = gql`
    mutation updateIssue($name: String, $public: Boolean) {
        updateIssue(name: $name, public: $public) {
            name
            public
        }
    }
`;

export {
    IssueQuery,
    IssueUpdate
}