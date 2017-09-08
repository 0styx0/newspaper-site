import { gql } from 'react-apollo';

const ArticleQuery = gql`

    query ArticleQuery($issue: ID) {
        issues(limit: 1, num: $issue) {
          max
          num
          articles {
            tags
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

const ArticlePreviewQuery = gql`

    query ArticleQuery($issue: ID) {
        issues(limit: 1, num: $issue) {
          num
          max
          name
          articles {
            url
            displayOrder
            views
            lede
            images(slide: true) {
                url
            }
          }
        }
    }
`;

const ArticleUpdate = gql`

    mutation ArticleUpdate($data: [Fields]) {
        updateArticles(data: $data) {
            id
            tags
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
    ArticlePreviewQuery,
    ArticleUpdate,
    ArticleDelete
};