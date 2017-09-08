
/**
 * Splits up an article into lede, body, images
 */
export function modifyArticle(article: string) {

    const { modifiedArticle, images } = separatePics(article);

    const firstParagraph = (modifiedArticle.match(/[^\/>]<\/p>/) || modifiedArticle.match(/<\/p>/)!)[0];

    const lede = modifiedArticle.substring(0, article.indexOf(firstParagraph) + 5);

    let body = modifiedArticle.substring(article.indexOf(firstParagraph) + 5);

    return {
        lede,
        body,
        images
    };
}

/**
 *
 * @return {
 *  images - array of {url: taken from `article`'s `img src`s, slide: whether img can be in slideshow}
 *  modifiedArticle - `article`, but with all <img> `src` replaced with `data-src`
 * }
 */
function separatePics(article: string) {

    const images: {url: string, slide: number}[] = [];
    let match: RegExpExecArray | null;
    const regex = /src='([^']+)'/gi;

    while ((match = regex.exec(article)) !== null) {
        images.push({url: match[1], slide: 1});
    }

    const modifiedArticle = article.replace(/src='[^']+'/gi, 'data-src');

    const imageTags = article.match(/<img.[^>]+/gi) || [];

    for (let i = 0; i < images.length; i++) {

        if (imageTags[i].indexOf('previewHidden') != -1) {
            images[i].slide = 0;
        }
    }

    return {
        modifiedArticle,
        images
    }
}

