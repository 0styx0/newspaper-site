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
                canEdit,
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

export {
    ArticleQuery
};
