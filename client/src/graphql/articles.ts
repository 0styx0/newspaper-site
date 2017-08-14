import { gql } from 'react-apollo';

const ArticleQuery = gql`

    query ArticleQuery($issue: ID) {
        issues(limit: 1, num: $issue) {
          max
          num
          articles {
            tags {
                all
            }
            url
            id
            displayOrder
            dateCreated
            views
            author {
                fullName
                profileLink
            }
          }
        }
    }

`;

export {
    ArticleQuery
};