import gql from 'graphql-tag';


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

const IssueInfoQuery = gql`
    query IssueInfo($num: ID) {
      issues(num: $num, limit: 1) {
          num
          max
          name
      }
    }
`;



export {
    IssueQuery,
    IssueInfoQuery,
    IssueUpdate
};
