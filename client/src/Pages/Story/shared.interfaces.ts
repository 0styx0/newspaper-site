interface Article {
    heading: string;
    body: string;
    canEdit: boolean;
    comments: {
        id: string;
        canDelete: boolean;
        content: string;
        dateCreated: string;
        author: {
            fullName: string;
            profileLink: string;
            id: string;
        }
    }[];
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