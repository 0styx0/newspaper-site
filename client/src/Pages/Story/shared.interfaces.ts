import { Comment } from '../../components/CommentList/shared.interface';

interface Story {
    canEdit: boolean;
    article: string;
    comments?: Comment[];
    tags: string[];
    id: string;
}

// this is more like container.state, while Story is what's actual being gotten from server
interface Article extends Story {
    heading: string;
    body: string;
}

interface ArticleInfo extends Article {
    issue: number;
    url: string;
    canEdit: boolean;
}

export {
    Story,
    Article,
    ArticleInfo
};