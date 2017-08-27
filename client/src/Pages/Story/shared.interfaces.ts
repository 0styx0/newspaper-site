import { Comment } from '../../components/CommentList/shared.interface';

interface Article {
    heading: string;
    body: string;
    canEdit: boolean;
    article: string;
    comments?: Comment[];
    tags: {
        all: string[]
    };
    id: string;
}

interface ArticleInfo extends Article {
    issue: number;
    url: string;
    canEdit: boolean;
}

export {
    Article,
    ArticleInfo
};