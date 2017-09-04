import { gql } from 'react-apollo';

const ArticleQuery = gql`
    query ArticleQuery($issue: Int!, $url: String!) {
        articles(issue: $issue, url: $url) {
            id,
            article,
            canEdit,
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
            tags {
                all
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
