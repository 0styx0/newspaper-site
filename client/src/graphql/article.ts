import gql from 'graphql-tag';

const ArticleQuery = gql`
    query ArticleQuery($issue: Int!, $url: String!) {
        articles(issue: $issue, url: $url) {
            id,
            article,
            canEdit,
            tags,
            comments {
                id
                content,
                dateCreated,
                canDelete,
                author {
                    fullName,
                    profileLink
                }
            }
        }
    }

`;

const ArticleCreate = gql`
    mutation ArticleCreate($tags: [String], $url: String!, $article: String!) {
        createArticle(tags: $tags, url: $url, article: $article) {
            issue
            url
        }
    }
`;

export {
    ArticleQuery,
    ArticleCreate
};
