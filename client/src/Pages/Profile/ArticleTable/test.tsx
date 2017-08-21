import * as React from 'react';
import { ArticleTableContainer } from './';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import localStorageMock from '../../../tests/localstorage.mock';
import casual from '../../../tests/casual.data';

import { Article } from '../shared.interfaces';

localStorageMock.setItem('jwt', JSON.stringify([,{level: 3}]));

casual.define('article', function(amount: number) {

    const articles: Article[] = [];

    while (amount-- > 0) {

        articles.push({
            tags: casual.tags,
            url: casual.articleUrl,
            id: casual.word + '--' + amount,
            dateCreated: casual.dateCreated,
            views: casual.randomPositive,
            issue: casual.randomPositive
        });
    }
});

describe('<ArticleTableContainer', () => {

    it('', () => {
console.log(casual.url);
        //
    });
});