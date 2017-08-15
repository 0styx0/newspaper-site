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

const ArticleUpdate = gql`

    mutation ArticleUpdate($data: [IdDisplayTagList]) {
        updateArticles(data: $data) {
            id
            tags {
                all
            }
            displayOrder
        }
    }
`;

const ArticleDelete = gql`

    mutation deleteArticles($ids: [ID]) {
        deleteArticles(ids: $ids) {
            id
        }
    }

`;

export {
    ArticleQuery,
    ArticleUpdate,
    ArticleDelete
};