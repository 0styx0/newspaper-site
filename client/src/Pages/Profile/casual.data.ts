import casual from '../../tests/casual.data';
import { Article } from './shared.interfaces';


casual.define('articles', function(amount: number) {

    const articles: Article[] = [];

    while (amount-- > 0) {

        articles.push({
            tags: casual.tags,
            url: casual.articleUrl,
            id: casual.word + '--' + amount,
            dateCreated: casual.dateCreated,
            views: casual.randomPositive,
            issue: casual.randomPositive,
            canEdit: true
        });
    }

    return articles;
});

interface Extended {
    articles: (amount: number) => Article[];
}

export default casual as Extended & typeof casual;