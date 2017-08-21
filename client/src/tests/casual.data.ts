import * as casual from 'casual';

casual.define('articleUrl', () => encodeURIComponent(casual.title));
casual.define('dateCreated', () => casual.date('YYYY-MM-DD'));
casual.define('randomPositive', () => casual.integer(0, 100));
casual.define('tags', () => ({
    all: casual.array_of_words(casual.integer(1, 3)) // can have at most 3 tags, at least 1
}));

interface Extended {
    articleUrl: string;
    dateCreated: string;
    randomPositive: number;
    tags: {
        all: string[]
    };
}

export default casual as Extended & typeof casual;