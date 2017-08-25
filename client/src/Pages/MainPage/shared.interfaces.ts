interface Issue {
    num: string | number;
    max: string | number;
    name: string;
}

interface Article {
    url: string;
    slideImages: string[];
    displayOrder: number;
    views: string | number;
    lede: string;
}

export {
    Issue,
    Article
};