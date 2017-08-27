import * as React from 'react';
import { MainPageContainer } from './container';
import { mount } from 'enzyme';
import * as renderer from 'react-test-renderer';
import { MemoryRouter } from 'react-router';
import casual from '../../tests/casual.data';

import { Article, Issue } from './shared.interfaces';

// import snapData from './articles.example';

interface Data {
    issues: ({
        articles: Article[];
    } & Issue)[];
}

casual.define('preview', () => {

   let amount = casual.randomPositive;

   const previews: Data = {
       issues: [{
           max: casual.integer(50, 100), // random numbers, just make sure max is greater than num
           num: casual.integer(1, 100),
           name: casual.title,
           articles: []
       }]
   };

   while (amount-- > 0) {

       previews.issues[0].articles.push({
            url: casual.articleUrl + '--' + amount,
            slideImages: Array(casual.randomPositive).fill(null).map(() => casual.url),
            displayOrder: casual.randomPositive,
            views: casual.randomPositive,
            lede: casual.text
       });
   }

   return previews;
});


describe('<MainPageContainer>', () => {

    describe('snapshots', () => {

        it('renders correctly', () => {

            const data = casual.preview;

            const tree = renderer.create(

                <MemoryRouter>
                    <MainPageContainer
                        data={data}
                        client={{
                            query: () => Promise.resolve({ data })
                        }}
                    />
                </MemoryRouter>
            ).toJSON();

            expect(tree).toMatchSnapshot();
        });
    });
});