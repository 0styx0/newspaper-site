import * as casual from 'casual';

casual.define('articleUrl', () => encodeURIComponent(casual.title));
casual.define('dateCreated', () => casual.date('YYYY-MM-DD'));
casual.define('randomPositive', () => casual.integer(0, 100));
// previous rule was limit of 3 tags. Might be revised to due change in db
casual.define('tags', () => casual.array_of_words(casual.integer(1, 3)));
casual.define('function', () => () =>  { return; });

interface Extended {
    articleUrl: string;
    dateCreated: string;
    randomPositive: number;
    tags: string[];
    function: Function;
}

export default casual as Extended & typeof casual;