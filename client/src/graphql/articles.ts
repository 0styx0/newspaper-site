import gql from 'graphql-tag';

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

const ArticlePreviewIssueQuery = gql`

    query ArticleIssueQuery($issue: ID) {
        issues(limit: 1, num: $issue) {
          articles {
            url
            issue
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

const ArticlePreviewTagQuery = gql`

    query ArticleTagQuery($issue: Int, $tag: String) {
        articles(issue: $issue, tag: $tag) {
          url
          issue
          displayOrder
          views
          lede
          images(slide: true) {
              url
          }
        }
    }
`;

const ArticleUpdate = gql`
    mutation ArticleUpdate($data: [UpdateArticle], $password: String) {
        updateArticles(data: $data, password: $password) {
            id
            tags
            displayOrder
        }
    }
`;

const EditArticle = gql`
    mutation EditArticle($id: ID, $article: String) {
        editArticle(id: $id, article: $article) {
            id
            tags
            displayOrder
        }
    }
`;

const ArticleDelete = gql`

    mutation deleteArticles($ids: [ID], $password: String!) {
        deleteArticles(ids: $ids, password: $password) {
            id
        }
    }

`;

export {
    ArticleQuery,
    ArticlePreviewIssueQuery,
    ArticlePreviewTagQuery,
    ArticleUpdate,
    EditArticle,
    ArticleDelete
};