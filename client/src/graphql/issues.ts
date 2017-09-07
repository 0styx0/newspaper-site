import { gql } from 'react-apollo';


const IssueQuery = gql`
    query IssueQuery {
        issues {
            num
            name
            views
            datePublished
            public
            canEdit
        }
    }
`;

const IssueUpdate = gql`
    mutation updateIssue($name: String, $public: Boolean, $password: String!) {
        updateIssue(name: $name, public: $public, password: $password) {
            name
            public
        }
    }
`;

export {
    IssueQuery,
    IssueUpdate
};
