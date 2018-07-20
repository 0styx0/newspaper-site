import * as casual from 'casual';
import { Issue } from '../Pages/MainPage/shared.interfaces';
import { Comment } from '../components/CommentList/shared.interface';

interface Extended {
    articleUrl: string;
    dateCreated: string;
    randomPositive: number;
    tags: string[];
    article: string;
    articleHeader: string;
    articleBody: string;
    issueData: Issue;
    comments: Comment[];
    function: Function;
}

const customCasual = casual as Extended & typeof casual;

customCasual.define('articleUrl', () => encodeURIComponent(customCasual.title));
customCasual.define('dateCreated', () => customCasual.date('YYYY-MM-DD'));
customCasual.define('randomPositive', () => customCasual.integer(0, 100));
// previous rule was limit of 3 tags. Might be revised to due change in db
customCasual.define('tags', () => [...new Set(customCasual.array_of_words(customCasual.integer(1, 3)))]);
customCasual.define('function', () => () =>  { return; });
customCasual.define('articleHeader', () => `<h1>${casual.title}</h1><h4>${casual.title}</h4>`);
customCasual.define('articleBody', () => `<p>${casual.text}</p>`);
customCasual.define('article', () => customCasual.articleHeader + customCasual.articleBody);
customCasual.define('issue', () => customCasual.randomPositive);
customCasual.define('issueData', () => ({
    max: casual.integer(50, 100), // random numbers, just make sure max is greater than num
    num: casual.integer(1, 100),
    name: casual.title
}));

customCasual.define('comments', () => {

    let amount = customCasual.randomPositive;
    const comments = [] as Comment[];

    while (amount-- > 0) {

        comments.push({
            id: customCasual.word + '--' + amount,
            content: customCasual.text,
            dateCreated: customCasual.dateCreated,
            canDelete: true,
            author: {
                fullName: casual.full_name,
                profileLink: casual.word,
                id: casual.word + '--' + amount
            }
        });
    }

    return comments;
});

export default customCasual;
