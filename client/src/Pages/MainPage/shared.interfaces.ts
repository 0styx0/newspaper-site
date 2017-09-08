interface Issue {
    num: number;
    max: number;
    name: string;
}

interface Article {
    url: string;
    images: {
       url: string
    }[];
    displayOrder: number;
    views: number;
    lede: string;
}

export {
    Issue,
    Article
};