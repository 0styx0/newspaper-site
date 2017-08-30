import * as sanitizeHTML from 'sanitize-html';


const sanitizeOptions = {

    allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                 'blockquote', 'p', 'a',
                 'ul', 'ol', 'li',
                  'i', 'strong', 'em', 'strike', 'code', 'br', 'div',
                 'caption', 'pre' ],
    allowedAttributes: {
        a: [ 'href' ],
        img: [ 'src', 'alt' ]
    },
    selfClosing: [ 'img', 'br' ],
    allowedSchemes: [ 'http', 'https', 'mailto' ],
    '*': ['class'],
    transformTags: {
        'b': 'strong',
        'i': 'em'
    }
}


/**
 * @return sanitized version of toSanitize
 */
export default function sanitize(toSanitize: any) {

    if (toSanitize === null) { // weird thing: typeof null = 'object' (https://stackoverflow.com/a/18808270)
        return toSanitize;
    }

    // if array or object, recurse through it
    if (typeof toSanitize === 'object') {

        let tmp: any = Array.isArray(toSanitize) ? [] : {};

        for (const key in toSanitize) {
            tmp[key] = sanitize(toSanitize[key]);
        }

        return tmp;
    }

    return sanitizeHTML(toSanitize, sanitizeOptions);
}